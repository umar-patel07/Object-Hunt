import React, { useEffect, useRef } from 'react';
import { MapType, PlayerData } from '../types';

interface MinimapProps {
  activePlayer?: PlayerData;
  mapType: MapType;
}

export const Minimap: React.FC<MinimapProps> = ({ activePlayer, mapType }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activePlayer) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const center = width / 2;
    const radius = width / 2 - 6;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Dark radar background
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(18, 22, 30, 0.85)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#4a5568';
    ctx.stroke();

    // Radar concentric grid rings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(center, center, radius * 0.4, 0, Math.PI * 2);
    ctx.arc(center, center, radius * 0.75, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(center, center - radius);
    ctx.lineTo(center, center + radius);
    ctx.moveTo(center - radius, center);
    ctx.lineTo(center + radius, center);
    ctx.stroke();

    // Scale map coordinates (-10 to 10) to minimap pixels
    const mapScale = (radius * 0.85) / 10;
    const px = center + activePlayer.position[0] * mapScale;
    const py = center + activePlayer.position[2] * mapScale;

    // Draw active player marker (triangle pointing in facing direction)
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(activePlayer.rotation);

    ctx.fillStyle = activePlayer.role === 'SEEKER' ? '#ef4444' : '#10b981';
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(6, 7);
    ctx.lineTo(0, 4);
    ctx.lineTo(-6, 7);
    ctx.closePath();
    ctx.fill();

    // Subtle glow
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }, [activePlayer, mapType]);

  const mapLabel =
    mapType === 'bedroom' ? 'Bedroom Map' : mapType === 'garden' ? 'Garden Map' : 'Supermarket Map';

  return (
    <div className="relative flex flex-col items-center select-none">
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full shadow-2xl ring-2 ring-white/20 overflow-hidden backdrop-blur-md">
        <canvas ref={canvasRef} width={128} height={128} className="w-full h-full" />
      </div>
      <div className="mt-1.5 px-3 py-0.5 rounded-full bg-black/75 border border-white/10 text-white font-bold text-xs tracking-wide shadow-md">
        {mapLabel}
      </div>
    </div>
  );
};
