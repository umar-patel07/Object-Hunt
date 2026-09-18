import React from 'react';
import { PlayerData } from '../types';
import { ArrowLeft, Play, ShieldAlert, Sparkles, Bot, User, Check } from 'lucide-react';

interface PlayerSetupProps {
  players: PlayerData[];
  onUpdatePlayers: (players: PlayerData[]) => void;
  onConfirmAndPlay: () => void;
  onBack: () => void;
}

const AVAILABLE_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Yellow/Orange
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#ef4444', // Red
];

export const PlayerSetup: React.FC<PlayerSetupProps> = ({
  players,
  onUpdatePlayers,
  onConfirmAndPlay,
  onBack,
}) => {
  const handleNameChange = (id: string, newName: string) => {
    const updated = players.map((p) => (p.id === id ? { ...p, name: newName } : p));
    onUpdatePlayers(updated);
  };

  const handleToggleBot = (id: string) => {
    const updated = players.map((p) => (p.id === id ? { ...p, isBot: !p.isBot } : p));
    onUpdatePlayers(updated);
  };

  const handleSetSeeker = (id: string) => {
    const updated = players.map((p) => ({
      ...p,
      role: (p.id === id ? 'SEEKER' : 'HIDER') as 'SEEKER' | 'HIDER',
    }));
    onUpdatePlayers(updated);
  };

  const handleColorChange = (id: string, color: string) => {
    const updated = players.map((p) => (p.id === id ? { ...p, color } : p));
    onUpdatePlayers(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl select-none font-sans overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#1e2030] border border-white/20 rounded-3xl shadow-2xl p-6 flex flex-col gap-6 my-auto text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK</span>
          </button>
          <div className="flex flex-col items-center">
            <h2 className="text-xl sm:text-2xl font-black tracking-wide font-['Fredoka']">
              PLAYER SETUP &amp; ROLES
            </h2>
            <span className="text-xs text-amber-300 font-semibold">
              Select Starting Seeker &bull; Exactly 1 Seeker Required
            </span>
          </div>
          <div className="w-16" />
        </div>

        {/* Players List */}
        <div className="flex flex-col gap-3 max-h-[55vh] overflow-y-auto pr-1">
          {players.map((p, idx) => {
            const isSeeker = p.role === 'SEEKER';
            return (
              <div
                key={p.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border transition-all gap-3 ${
                  isSeeker
                    ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                {/* Player Number badge & Name Input */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl font-black text-black flex items-center justify-center text-sm shadow-md"
                    style={{ backgroundColor: p.color }}
                  >
                    P{idx + 1}
                  </div>

                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => handleNameChange(p.id, e.target.value)}
                    maxLength={14}
                    className="bg-black/40 border border-white/15 px-3 py-1.5 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-amber-400 max-w-[140px]"
                  />

                  {/* Human / Bot Toggle */}
                  <button
                    onClick={() => handleToggleBot(p.id)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border transition-all ${
                      p.isBot
                        ? 'bg-purple-900/50 border-purple-400/50 text-purple-300'
                        : 'bg-blue-900/50 border-blue-400/50 text-blue-300'
                    }`}
                  >
                    {p.isBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    <span>{p.isBot ? 'AI BOT' : 'HUMAN'}</span>
                  </button>
                </div>

                {/* Color swatches & Role button */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  {/* Color swatches */}
                  <div className="flex items-center gap-1">
                    {AVAILABLE_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => handleColorChange(p.id, c)}
                        className={`w-5 h-5 rounded-full transition-transform ${
                          p.color === c ? 'scale-125 ring-2 ring-white' : 'opacity-60 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>

                  {/* Role picker button */}
                  <button
                    onClick={() => handleSetSeeker(p.id)}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 border transition-all active:scale-95 ${
                      isSeeker
                        ? 'bg-red-600 text-white border-red-300 shadow-lg'
                        : 'bg-white/10 hover:bg-white/20 text-white/70 border-white/15'
                    }`}
                  >
                    {isSeeker ? (
                      <>
                        <ShieldAlert className="w-4 h-4" />
                        <span>SEEKER</span>
                        <Check className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span>MAKE SEEKER</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info & Play button */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <div className="text-xs text-white/60 font-medium">
            Seeker rotates automatically to the next player after each round!
          </div>

          <button
            onClick={onConfirmAndPlay}
            className="py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-white font-black text-base shadow-xl flex items-center gap-2 cursor-pointer font-['Fredoka']"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>CONFIRM &amp; PLAY</span>
          </button>
        </div>
      </div>
    </div>
  );
};
