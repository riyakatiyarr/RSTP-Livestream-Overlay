import React, { useState } from 'react';
import { Plus, Trash2, Type, Image as ImageIcon, Settings, Play, Pause, RefreshCw } from 'lucide-react';
import axios from 'axios';

const ControlPanel = ({
    overlays,
    setOverlays,
    onAddOverlay,
    onUpdateOverlay,
    onDeleteOverlay,
    rtspUrl,
    setRtspUrl,
    isPlaying,
    setIsPlaying
}) => {
    const [activeTab, setActiveTab] = useState('overlays'); // 'overlays' or 'settings'

    const handleCreate = (type) => {
        const newOverlay = {
            type,
            content: type === 'text' ? 'New Text Overlay' : 'https://via.placeholder.com/150',
            position: { x: 50, y: 50 },
            size: { width: 200, height: type === 'text' ? 60 : 150 },
            styles: {
                color: '#ffffff',
                fontSize: '16px',
                backgroundColor: type === 'text' ? 'rgba(0,0,0,0.5)' : 'transparent',
                borderRadius: '4px',
                padding: '8px'
            }
        };
        onAddOverlay(newOverlay);
    };

    return (
        <div className="sidebar">
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Settings size={20} className="text-accent-primary" />
                    Stream Manager
                </h2>
            </div>

            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <label className="input-label">RTSP Source URL</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="rtsp://..."
                        value={rtspUrl}
                        onChange={(e) => setRtspUrl(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button
                        className={`btn ${isPlaying ? 'btn-danger' : 'btn-primary'}`}
                        style={{ flex: 1, justifyContent: 'center' }}
                        onClick={() => setIsPlaying(!isPlaying)}
                    >
                        {isPlaying ? <><Pause size={16} /> Stop</> : <><Play size={16} /> Play Stream</>}
                    </button>
                </div>

                <div style={{ marginTop: '1rem' }}>
                    <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Volume</span>
                        <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>(Stream Audio N/A)</span>
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        defaultValue="50"
                        style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                    />
                </div>
            </div>

            <div style={{ padding: '1rem 1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <button
                        className={activeTab === 'overlays' ? 'btn-primary' : 'btn-icon'}
                        onClick={() => setActiveTab('overlays')}
                        style={{ flex: 1, justifyContent: 'center' }}
                    >
                        Overlays
                    </button>
                    <button
                        className={activeTab === 'json' ? 'btn-primary' : 'btn-icon'}
                        onClick={() => setActiveTab('json')}
                        style={{ flex: 1, justifyContent: 'center' }}
                    >
                        Data View
                    </button>
                </div>

                {activeTab === 'overlays' && (
                    <>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleCreate('text')}>
                                <Type size={16} /> Add Text
                            </button>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleCreate('image')}>
                                <ImageIcon size={16} /> Add Image
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', maxHeight: 'calc(100vh - 450px)' }}>
                            {overlays.map((overlay, index) => (
                                <div key={overlay._id || index} style={{
                                    background: 'var(--bg-primary)',
                                    padding: '1rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                                            {overlay.type}
                                        </span>
                                        <button className="btn-icon" style={{ color: 'var(--danger)', padding: '2px' }} onClick={() => onDeleteOverlay(overlay._id)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label">Content</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={overlay.content}
                                            onChange={(e) => onUpdateOverlay(overlay._id, { content: e.target.value })}
                                        />
                                    </div>

                                    {overlay.type === 'text' && (
                                        <div className="input-group">
                                            <label className="input-label">Font Size (px)</label>
                                            <input
                                                type="number"
                                                className="input-field"
                                                value={parseInt(overlay.styles?.fontSize || 16)}
                                                onChange={(e) => onUpdateOverlay(overlay._id, {
                                                    styles: { ...overlay.styles, fontSize: `${e.target.value}px` }
                                                })}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {overlays.length === 0 && (
                                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                                    No active overlays. Add one to get started.
                                </div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'json' && (
                    <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', fontFamily: 'monospace', overflowX: 'auto' }}>
                        <pre>{JSON.stringify(overlays, null, 2)}</pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ControlPanel;
