# RTSP Livestream Overlay Web Application

A full-stack web application designed to view RTSP livestreams and manage real-time overlays using a Flask backend and React frontend.

## Features
- **Real-time RTSP Streaming**: View live video feeds directly in your browser.
- **Dynamic Overlays**: Create, read, update, and delete overlays (text/images) on top of the video stream.
- **Simulation Mode**: Built-in simulation mode for testing without a live camera.
- **MongoDB Integration**: Persist overlay configurations using MongoDB.

## Project Structure

- **backend/**: Python Flask API + OpenCV for stream processing.
- **frontend/**: React (Vite) application for the dashboard and video player.

## Prerequisites

- **Python** (3.8 or higher)
- **Node.js** (v16 or higher)
- **MongoDB** Connection URI (currently configured in `backend/app.py` for demo purposes)

---

## Setup Instructions

### 1. Backend Setup

The backend runs the API server and handles video stream processing.

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    # Windows
    python -m venv venv
    venv\Scripts\activate

    # macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run the Backend Server:**
    ```bash
    python app.py
    ```
    > The server will start on `http://localhost:5000`.

### 2. Frontend Setup

The frontend provides the user interface for viewing streams and managing overlays.

1.  **Navigate to the frontend directory:**
    Open a *new* terminal window (keep the backend running) and run:
    ```bash
    cd frontend
    ```

2.  **Install Node dependencies:**
    ```bash
    npm install
    ```

3.  **Start the Development Server:**
    ```bash
    npm run dev
    ```
    > The application will typically start on `http://localhost:5173`. Open this URL in your browser.

---

## Usage Guide

1.  **Connect a Stream**: 
    - Enter a valid RTSP URL (e.g., `rtsp://user:pass@ip:port/stream`).
    - Or type **`simulation`** and click "Start Stream" to view a test animation.

2.  **Manage Overlays**:
    - Use the controls to add new overlays.
    - Drag and drop overlays on the video preview to position them.
    - Edit text or styles as needed.

## Troubleshooting

-   **"Module not found" errors**: Ensure you activated the virtual environment before running the backend.
-   **MongoDB Connection Error**: If you see connection errors in the backend console, ensure your IP address is allowed in your MongoDB Atlas cluster network access settings.
-   **Video Lag**: RTSP streaming via HTTP (MJPEG) can be bandwidth-intensive. Ensure you are on a stable network.
