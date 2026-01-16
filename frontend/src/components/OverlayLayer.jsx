import React from 'react';
import { Rnd } from 'react-rnd';

const OverlayLayer = ({ overlays, onUpdateOverlay }) => {
    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none', // Allow clicks to pass through to video controls if not on overlay
            overflow: 'hidden'
        }}>
            {overlays.map((overlay) => (
                <Rnd
                    key={overlay._id}
                    size={{ width: overlay.size.width, height: overlay.size.height }}
                    position={{ x: overlay.position.x, y: overlay.position.y }}
                    onDragStop={(e, d) => {
                        onUpdateOverlay(overlay._id, { position: { x: d.x, y: d.y } });
                    }}
                    onResizeStop={(e, direction, ref, delta, position) => {
                        onUpdateOverlay(overlay._id, {
                            size: { width: ref.style.width, height: ref.style.height },
                            position: position,
                        });
                    }}
                    bounds="parent"
                    style={{ pointerEvents: 'auto' }} // Re-enable pointer events for the overlay itself
                >
                    <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        ...overlay.styles,
                        border: '1px dashed rgba(255, 255, 255, 0.3)', // Visual helper
                    }}>
                        {overlay.type === 'image' ? (
                            <img
                                src={overlay.content}
                                alt="Overlay"
                                style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Invalid+Image' }}
                            />
                        ) : (
                            <span style={{ pointerEvents: 'none' }}>{overlay.content}</span>
                        )}
                    </div>
                </Rnd>
            ))}
        </div>
    );
};

export default OverlayLayer;
