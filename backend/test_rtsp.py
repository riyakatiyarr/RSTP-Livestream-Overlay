
import cv2
import os

# Force TCP for RTSP (better for firewalls/stable connections)
os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp"

rtsp_url = "rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4"
print(f"Testing URL (TCP): {rtsp_url}")

cap = cv2.VideoCapture(rtsp_url)

if not cap.isOpened():
    print("❌ Failed to open stream.")
else:
    print("✅ Successfully opened stream.")
    ret, frame = cap.read()
    if ret:
        print("✅ Successfully read a frame.")
        print(f"Frame shape: {frame.shape}")
    else:
        print("❌ Failed to read frame.")
    cap.release()
