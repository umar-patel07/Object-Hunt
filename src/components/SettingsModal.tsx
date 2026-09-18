import React from 'react';
import { GameSettings } from '../types';
import { X, Volume2, Monitor, Clock, Shield } from 'lucide-react';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl select-none font-sans overflow-y-auto">
      <div className="w-full max-w-lg bg-[#1e2030] border border-white/20 rounded-3xl shadow-2xl p-6 flex flex-col gap-5 text-white my-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Monitor className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl font-black font-['Fredoka']">GAME SETTINGS</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Volume */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
            <Volume2 className="w-4 h-4" />
            <span>AUDIO CONTROLS</span>
          </div>

          <div className="flex flex-col gap-2 bg-white/5 p-3 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold">Sound Effects (SFX)</span>
              <span className="font-mono">{Math.round(settings.soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.soundVolume}
              onChange={(e) =>
                onUpdateSettings({ ...settings, soundVolume: parseFloat(e.target.value) })
              }
              className="accent-amber-400 cursor-pointer"
            />

            <div className="flex items-center justify-between text-xs mt-2">
              <span className="font-semibold">Music Volume</span>
              <span className="font-mono">{Math.round(settings.musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicVolume}
              onChange={(e) =>
                onUpdateSettings({ ...settings, musicVolume: parseFloat(e.target.value) })
              }
              className="accent-amber-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Round Timers */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
            <Clock className="w-4 h-4" />
            <span>ROUND TIMERS</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5 bg-white/5 p-3 rounded-2xl border border-white/5">
              <span className="text-xs font-semibold">Prep Timer</span>
              <div className="grid grid-cols-3 gap-1">
                {[15, 20, 30].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => onUpdateSettings({ ...settings, prepTime: sec })}
                    className={`py-1 rounded-lg text-xs font-bold transition-all ${
                      settings.prepTime === sec
                        ? 'bg-amber-500 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white/70'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 bg-white/5 p-3 rounded-2xl border border-white/5">
              <span className="text-xs font-semibold">Round Timer</span>
              <div className="grid grid-cols-3 gap-1">
                {[60, 120, 180].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => onUpdateSettings({ ...settings, roundTime: sec })}
                    className={`py-1 rounded-lg text-xs font-bold transition-all ${
                      settings.roundTime === sec
                        ? 'bg-amber-500 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white/70'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Graphics Quality */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
            <Shield className="w-4 h-4" />
            <span>GRAPHICS PRESET</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {(['low', 'medium', 'high', 'ultra'] as const).map((q) => (
              <button
                key={q}
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    graphicsQuality: q,
                    shadows: q !== 'low',
                  })
                }
                className={`py-2 rounded-xl text-xs font-black uppercase transition-all ${
                  settings.graphicsQuality === q
                    ? 'bg-amber-500 text-white shadow-lg'
                    : 'bg-white/10 hover:bg-white/20 text-white/70'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 mt-2 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-white font-black font-['Fredoka'] cursor-pointer"
        >
          SAVE &amp; CLOSE
        </button>
      </div>
    </div>
  );
};
