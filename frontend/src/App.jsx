import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ControlPanel from './components/ControlPanel';
import VideoPlayer from './components/VideoPlayer';

const API_BASE = 'http://127.0.0.1:5000/api';

function App() {
  const [overlays, setOverlays] = useState([]);
  const [rtspUrl, setRtspUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  // Fetch Overlays
  useEffect(() => {
    fetchOverlays();
  }, []);

  const fetchOverlays = async () => {
    try {
      const res = await axios.get(`${API_BASE}/overlays`);
      setOverlays(res.data);
    } catch (err) {
      console.error("Failed to fetch overlays", err);
    }
  };

  const addOverlay = async (overlayData) => {
    try {
      const res = await axios.post(`${API_BASE}/overlays`, overlayData);
      setOverlays([...overlays, res.data]);
    } catch (err) {
      console.error("Failed to create overlay", err);
    }
  };

  const updateOverlay = async (id, updates) => {
    // Optimistic Update
    setOverlays(prev => prev.map(o => o._id === id ? { ...o, ...updates } : o));

    try {
      // In a real app, you might debounce this network call
      await axios.put(`${API_BASE}/overlays/${id}`, updates);
    } catch (err) {
      console.error("Failed to update overlay", err);
      // Revert if needed, but for now simple logging
      fetchOverlays();
    }
  };

  const deleteOverlay = async (id) => {
    try {
      await axios.delete(`${API_BASE}/overlays/${id}`);
      setOverlays(prev => prev.filter(o => o._id !== id));
    } catch (err) {
      console.error("Failed to delete overlay", err);
    }
  };

  return (
    <div className="app-container">
      <div className="main-content">
        <VideoPlayer
          rtspUrl={rtspUrl}
          isPlaying={isPlaying}
          overlays={overlays}
          onUpdateOverlay={updateOverlay}
        />
      </div>
      <ControlPanel
        overlays={overlays}
        setOverlays={setOverlays}
        onAddOverlay={addOverlay}
        onUpdateOverlay={updateOverlay}
        onDeleteOverlay={deleteOverlay}
        rtspUrl={rtspUrl}
        setRtspUrl={setRtspUrl}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
      />
    </div>
  );
}

export default App;
