import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeCanvasProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCodeCanvas: React.FC<QRCodeCanvasProps> = ({
  value,
  size = 90,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 1,
        color: {
          dark: '#171717',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      }).catch((err) => {
        console.error('Error rendering QR code:', err);
      });
    }
  }, [value, size]);

  return (
    <canvas
      ref={canvasRef}
      className={`rounded shadow-xs inline-block ${className}`}
      width={size}
      height={size}
    />
  );
};
