import os
import cv2
import time
from flask import Flask, Response, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId

from pymongo.server_api import ServerApi

# Force TCP for RTSP (better for firewalls/stable connections)
os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp"

app = Flask(__name__)
CORS(app)

# MongoDB Setup (Atlas)
uri = "mongodb+srv://Riya:12345@rstp-db.3l3appn.mongodb.net/?appName=RSTP-DB"

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))
db = client['rtsp_overlay_app']
overlays_collection = db['overlays']

# Verify connection on startup
try:
    client.admin.command('ping')
    print("✅ Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(f"❌ ERROR: Could not connect to MongoDB Atlas.")
    print(f"Details: {e}")

import numpy as np

# ... imports ...

def generate_frames(rtsp_url):
    print(f"Attempting to connect to stream: {rtsp_url}")
    
    # --- SIMULATION MODE ---
    if rtsp_url == "simulation":
        print("Starting Simulation Mode...")
        width, height = 1280, 720
        x, y = 640, 360
        dx, dy = 15, 15
        
        while True:
            # Create black background
            frame = np.zeros((height, width, 3), dtype=np.uint8)
            
            # Draw bouncing ball
            cv2.circle(frame, (x, y), 50, (0, 255, 255), -1)
            
            # Move ball
            x += dx
            y += dy
            
            # Bounce off walls
            if x <= 50 or x >= width - 50: dx = -dx
            if y <= 50 or y >= height - 50: dy = -dy
            
            # Add Info Text
            cv2.putText(frame, f"TEST STREAM: {time.ctime()}", (50, 100), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1.5, (255, 255, 255), 3)
            cv2.putText(frame, "Simulation Mode Active", (50, 650), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            
            # Encode
            ret, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = buffer.tobytes()
            
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            
            time.sleep(0.033) # Approx 30 FPS
        return
    # -----------------------

    # If no URL provided, return nothing or placeholder
    if not rtsp_url:
        print("No URL provided")
        return
        
    cap = cv2.VideoCapture(rtsp_url)
    
    # Retry mechanism or error handling
    if not cap.isOpened():
        print(f"Error: Could not open video source {rtsp_url}")
        
        # Create an error frame
        height, width = 720, 1280
        img = np.zeros((height, width, 3), dtype=np.uint8)
        # Add visual error message
        cv2.putText(img, "Connection Failed", (50, 300), cv2.FONT_HERSHEY_SIMPLEX, 3, (0, 0, 255), 5)
        # Truncate URL if too long
        display_url = rtsp_url[:50] + "..." if len(rtsp_url) > 50 else rtsp_url
        cv2.putText(img, display_url, (50, 400), cv2.FONT_HERSHEY_SIMPLEX, 1, (200, 200, 200), 2)
        cv2.putText(img, "Check URL or Network Connectivity", (50, 500), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 255), 3)
        
        ret, buffer = cv2.imencode('.jpg', img)
        frame = buffer.tobytes()
        
        # Yield single frame then exit
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        return

    print(f"Successfully opened stream: {rtsp_url}")

    print(f"Successfully opened stream: {rtsp_url}")
    frame_count = 0
    while True:
        success, frame = cap.read()
        if not success:
            print("Failed to read frame from stream (stream ended or error)")
            # If stream ends or fails, break (or retry logic could go here)
            cap.release()
            break
            
        frame_count += 1
        if frame_count % 30 == 0:
            print(f"Streaming frame {frame_count}...")

        # Encode frame as JPEG
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        
        # Yield frame in multipart format
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/')
def index():
    return "<h1>RTSP Overlay Backend is Running!</h1><p>Use /video_feed?url=... for stream or /api/overlays for data.</p>"

@app.route('/video_feed')
def video_feed():
    rtsp_url = request.args.get('url')
    if not rtsp_url:
        return "No URL provided", 400
    
    return Response(generate_frames(rtsp_url),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

# --- CRUD APIs for Overlays ---

@app.route('/api/overlays', methods=['GET'])
def get_overlays():
    overlays = list(overlays_collection.find())
    for overlay in overlays:
        overlay['_id'] = str(overlay['_id'])
    return jsonify(overlays)

@app.route('/api/overlays', methods=['POST'])
def create_overlay():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    # Basic validation
    required_fields = ['content', 'type', 'position', 'size']
    # Start default position/size if not fully present?
    # Expected format: 
    # {
    #   "type": "text" | "image",
    #   "content": "Hello" | "http://...",
    #   "position": {"x": 0, "y": 0},
    #   "size": {"width": 100, "height": 50},
    #   "styles": {} (optional)
    # }
    
    try:
        new_overlay = {
            "type": data.get("type", "text"),
            "content": data.get("content", ""),
            "position": data.get("position", {"x": 50, "y": 50}),
            "size": data.get("size", {"width": 200, "height": 100}),
            "styles": data.get("styles", {})
        }
        result = overlays_collection.insert_one(new_overlay)
        new_overlay['_id'] = str(result.inserted_id)
        return jsonify(new_overlay), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/overlays/<id>', methods=['PUT'])
def update_overlay(id):
    data = request.json
    try:
        updated_data = {}
        if 'position' in data: updated_data['position'] = data['position']
        if 'size' in data: updated_data['size'] = data['size']
        if 'content' in data: updated_data['content'] = data['content']
        if 'styles' in data: updated_data['styles'] = data['styles']
        
        result = overlays_collection.update_one(
            {'_id': ObjectId(id)},
            {'$set': updated_data}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "Overlay not found"}), 404
            
        return jsonify({"message": "Updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/overlays/<id>', methods=['DELETE'])
def delete_overlay(id):
    try:
        result = overlays_collection.delete_one({'_id': ObjectId(id)})
        if result.deleted_count == 0:
            return jsonify({"error": "Overlay not found"}), 404
        return jsonify({"message": "Deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
