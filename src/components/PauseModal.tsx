import React from 'react';
import { Play, RefreshCw, Home, Settings, HelpCircle } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestartRound: () => void;
  onOpenSettings: () => void;
  onOpenHowToPlay: () => void;
  onQuitToMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestartRound,
  onOpenSettings,
  onOpenHowToPlay,
  onQuitToMenu,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl select-none font-sans">
      <div className="w-full max-w-sm bg-[#1e2030] border-2 border-white/20 rounded-3xl shadow-2xl p-6 flex flex-col gap-4 text-white text-center">
        <h2 className="text-3xl font-black font-['Fredoka'] tracking-wider uppercase text-amber-400">
          GAME PAUSED
        </h2>
        <p className="text-xs text-white/60 font-medium">
          Take a breather! Ready to resume the prop hunt?
        </p>

        <div className="flex flex-col gap-2.5 mt-2">
          <button
            onClick={onResume}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-white font-black text-base shadow-xl flex items-center justify-center gap-2 cursor-pointer font-['Fredoka']"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>RESUME GAME</span>
          </button>

          <button
            onClick={onRestartRound}
            className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold border border-white/10 flex items-center justify-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4 text-amber-300" />
            <span>Restart Current Round</span>
          </button>

          <button
            onClick={onOpenHowToPlay}
            className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold border border-white/10 flex items-center justify-center gap-2 transition-all"
          >
            <HelpCircle className="w-4 h-4 text-amber-300" />
            <span>How to Play / Controls</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold border border-white/10 flex items-center justify-center gap-2 transition-all"
          >
            <Settings className="w-4 h-4 text-amber-300" />
            <span>Settings</span>
          </button>

          <button
            onClick={onQuitToMenu}
            className="w-full py-2.5 px-4 rounded-xl bg-red-900/30 hover:bg-red-900/50 text-red-300 active:scale-95 text-xs font-bold border border-red-500/20 flex items-center justify-center gap-2 transition-all mt-2"
          >
            <Home className="w-4 h-4" />
            <span>Quit to Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
