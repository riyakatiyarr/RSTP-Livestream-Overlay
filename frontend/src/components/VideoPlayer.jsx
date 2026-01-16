import React, { useState } from 'react';
import OverlayLayer from './OverlayLayer';

const VideoPlayer = ({ rtspUrl, isPlaying, overlays, onUpdateOverlay }) => {
    const backendUrl = 'http://127.0.0.1:5000/video_feed';

    // Construct user-facing source URL
    const videoSource = isPlaying && rtspUrl
        ? `${backendUrl}?url=${encodeURIComponent(rtspUrl)}`
        : null;

    return (
        <div className="video-container" style={{
            position: 'relative',
            width: '100%',
            maxWidth: '1280px',
            aspectRatio: '16/9',
            backgroundImage: 'radial-gradient(circle, #333 0%, #000 100%)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-color)'
        }}>
            {videoSource ? (
                <img
                    src={videoSource}
                    alt="Live Stream"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            ) : (
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📺</div>
                    <p>Stream Paused or No Signal</p>
                    <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Enter an RTSP URL and click Play</p>
                </div>
            )}

            {/* Overlays are rendered on top of the video/placeholder */}
            <OverlayLayer overlays={overlays} onUpdateOverlay={onUpdateOverlay} />
        </div>
    );
};

export default VideoPlayer;
