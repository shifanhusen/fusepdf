// Simple QR Code implementation fallback
// This is a lightweight QR code library replacement
(function(global) {
    'use strict';
    
    // QR Code implementation using qrious library as fallback
    const QRCode = {
        toCanvas: async function(canvas, text, options = {}) {
            try {
                // If qrious is available, use it
                if (typeof QRious !== 'undefined') {
                    const qr = new QRious({
                        element: canvas,
                        value: text,
                        size: options.width || 256,
                        level: options.errorCorrectionLevel || 'M'
                    });
                    return canvas;
                }
                
                // Fallback: Draw a simple pattern or message
                const ctx = canvas.getContext('2d');
                const size = options.width || 256;
                canvas.width = size;
                canvas.height = size;
                
                // Fill background
                ctx.fillStyle = options.color?.light || '#ffffff';
                ctx.fillRect(0, 0, size, size);
                
                // Draw placeholder pattern
                ctx.fillStyle = options.color?.dark || '#000000';
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('QR Code', size/2, size/2 - 20);
                ctx.fillText(text.substring(0, 20), size/2, size/2);
                ctx.fillText('Please refresh', size/2, size/2 + 20);
                
                return canvas;
            } catch (error) {
                console.error('QR generation failed:', error);
                throw error;
            }
        },
        
        toDataURL: function(text, options = {}) {
            return new Promise((resolve, reject) => {
                const canvas = document.createElement('canvas');
                this.toCanvas(canvas, text, options)
                    .then(() => resolve(canvas.toDataURL()))
                    .catch(reject);
            });
        }
    };
    
    global.QRCode = QRCode;
})(typeof window !== 'undefined' ? window : this);