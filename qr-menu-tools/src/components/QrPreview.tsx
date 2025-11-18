import React, { useEffect, useRef } from 'react';
import qrcode from 'qrcode-generator';

interface QrPreviewProps {
  url: string;
  themeColor?: string;
  logoUrl?: string;
  size?: number;
}

export const QrPreview: React.FC<QrPreviewProps> = ({ 
  url, 
  themeColor = '#0082FF', 
  logoUrl,
  size = 300 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const qr = qrcode(0, 'H'); // High error correction for logo overlay
    qr.addData(url);
    qr.make();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const modules = qr.getModuleCount();
    const cellSize = size / modules;

    canvas.width = size;
    canvas.height = size;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Calculate logo area to avoid drawing QR modules there
    const logoSize = logoUrl ? size * 0.2 : 0;
    const logoX = (size - logoSize) / 2;
    const logoY = (size - logoSize) / 2;
    const logoRadius = logoSize / 2;
    const centerX = size / 2;
    const centerY = size / 2;

    // QR modules with rounded corners
    ctx.fillStyle = themeColor;
    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        if (qr.isDark(row, col)) {
          const x = col * cellSize;
          const y = row * cellSize;
          const moduleX = x + cellSize / 2;
          const moduleY = y + cellSize / 2;
          
          // Skip drawing modules in logo area if logo is provided
          if (logoUrl) {
            const distanceFromCenter = Math.sqrt(
              Math.pow(moduleX - centerX, 2) + Math.pow(moduleY - centerY, 2)
            );
            if (distanceFromCenter < logoRadius + 10) {
              continue; // Skip this module
            }
          }
          
          const radius = cellSize * 0.4;
          ctx.beginPath();
          ctx.roundRect(x, y, cellSize, cellSize, radius);
          ctx.fill();
        }
      }
    }

    // Add logo if provided
    if (logoUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // White circular background for logo with padding
        const bgSize = logoSize + 20;
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, bgSize / 2, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add subtle shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;
        
        // Draw logo in circular clip
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, logoSize / 2, 0, 2 * Math.PI);
        ctx.clip();
        
        ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
        ctx.restore();
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Optional: Add a thin border around logo
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, logoSize / 2, 0, 2 * Math.PI);
        ctx.stroke();
      };
      img.onerror = () => {
        console.warn('Failed to load logo image for QR code');
      };
      img.src = logoUrl;
    }
  }, [url, themeColor, logoUrl, size]);

  const downloadPNG = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'qr-menu.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const downloadSVG = () => {
    const qr = qrcode(0, 'H');
    qr.addData(url);
    qr.make();

    const modules = qr.getModuleCount();
    const cellSize = 10;
    const svgSize = modules * cellSize;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}">`;
    svg += `<rect width="${svgSize}" height="${svgSize}" fill="white"/>`;

    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        if (qr.isDark(row, col)) {
          const x = col * cellSize;
          const y = row * cellSize;
          svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${themeColor}" rx="4"/>`;
        }
      }
    }

    svg += '</svg>';

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.download = 'qr-menu.svg';
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvasRef} className="rounded-lg shadow-lg" />
      <div className="flex gap-3">
        <button
          onClick={downloadPNG}
          className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          📥 Download PNG
        </button>
        <button
          onClick={downloadSVG}
          className="px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          📥 Download SVG
        </button>
      </div>
    </div>
  );
};
