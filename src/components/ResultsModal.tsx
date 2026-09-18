import React from 'react';
import { PlayerData, RoundStats } from '../types';
import { Trophy, RefreshCw, ArrowRight, Home, ShieldAlert, Sparkles, MapPin } from 'lucide-react';

interface ResultsModalProps {
  stats: RoundStats;
  players: PlayerData[];
  onNextRound: () => void;
  onPlayAgain: () => void;
  onChangeMap: () => void;
  onMainMenu: () => void;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  stats,
  players,
  onNextRound,
  onPlayAgain,
  onChangeMap,
  onMainMenu,
}) => {
  const isSeekerWinner = stats.winner === 'SEEKER';
  const nextSeekerDisplayName = stats.nextSeekerName || 'Next Player';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl select-none font-sans overflow-y-auto">
      <div className="w-full max-w-xl bg-[#1e2030] border-2 border-amber-500/40 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.3)] p-6 sm:p-8 flex flex-col gap-5 text-white my-auto animate-in fade-in zoom-in duration-200">
        {/* Top Winner Trophy Banner */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mb-2 shadow-lg">
            <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
          </div>

          <span className="text-xs font-black uppercase tracking-widest text-amber-300">
            ROUND COMPLETE
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight font-['Fredoka'] mt-1">
            {isSeekerWinner ? 'SEEKER WINS!' : 'HIDERS WIN!'}
          </h2>
          <p className="text-white/75 text-sm mt-1 max-w-md">
            {isSeekerWinner
              ? `${stats.seekerName} discovered all hiders within the 3 allowed chances!`
              : stats.winReason === 'OUT_OF_CHANCES'
              ? `${stats.seekerName} ran out of chances (3 incorrect accusations)! The hiders prevailed!`
              : `Clever hiders survived until time expired!`}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
            <span className="text-[11px] font-bold text-white/50 uppercase">Seeker</span>
            <span className="text-sm sm:text-base font-black text-red-400 mt-0.5 truncate w-full">{stats.seekerName}</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
            <span className="text-[11px] font-bold text-white/50 uppercase">Discovered</span>
            <span className="text-sm sm:text-base font-black text-amber-400 mt-0.5">
              {stats.discoveredCount} / {stats.totalHiders}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
            <span className="text-[11px] font-bold text-white/50 uppercase">Chances Left</span>
            <span className={`text-sm sm:text-base font-black mt-0.5 ${stats.seekerChancesLeft && stats.seekerChancesLeft > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {stats.seekerChancesLeft ?? 0} / 3
            </span>
          </div>
        </div>

        {/* Seeker Rule & Next Seeker Card */}
        <div className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-amber-400" />
              <span className="font-extrabold text-sm text-amber-300">Next Round Seeker:</span>
            </div>
            <span className="font-black text-white bg-black/60 px-3 py-1 rounded-xl border border-amber-400/40 text-sm">
              {nextSeekerDisplayName}
            </span>
          </div>
          <p className="text-xs text-amber-100/80 leading-relaxed">
            {isSeekerWinner
              ? `🎯 All hiders found! The first hider caught (${stats.firstHiderCaughtName || nextSeekerDisplayName}) becomes the Seeker next round!`
              : `🔄 Seeker did not find all hiders in 3 chances! As per rules, ${stats.seekerName} remains the Seeker for the next round!`}
          </p>
        </div>

        {/* Hiders Status breakdown */}
        <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-black/40 border border-white/10 max-h-44 overflow-y-auto">
          <span className="text-xs font-black uppercase tracking-wider text-white/60">
            Hiders Summary
          </span>
          <div className="flex flex-col gap-1.5">
            {players
              .filter((p) => p.id !== stats.seekerId)
              .map((hider) => {
                const isDiscovered = hider.state === 'DISCOVERED';
                const time = stats.survivalTimes[hider.id] || stats.roundDuration;
                const isFirstCaught = hider.id === stats.firstHiderCaughtId;

                return (
                  <div
                    key={hider.id}
                    className={`flex items-center justify-between text-xs font-bold px-3 py-1.5 rounded-xl border ${
                      isFirstCaught
                        ? 'bg-amber-500/20 border-amber-400/50'
                        : 'bg-white/5 border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: hider.color }}
                      />
                      <span className="text-white">{hider.name}</span>
                      {isFirstCaught && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-400 text-black font-black text-[9px] uppercase">
                          1st Caught &bull; Next Seeker
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-white/50 font-mono text-[11px]">
                        {time}s
                      </span>
                      {isDiscovered ? (
                        <span className="px-2 py-0.5 rounded bg-red-900/50 text-red-300 border border-red-500/30 text-[10px]">
                          Caught
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 text-[10px]">
                          Survived!
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onNextRound}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-white font-black text-base shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer font-['Fredoka']"
          >
            <span>START NEXT ROUND ({nextSeekerDisplayName.toUpperCase()} AS SEEKER)</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={onPlayAgain}
              className="py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold border border-white/10 flex items-center justify-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Rematch</span>
            </button>
            <button
              onClick={onChangeMap}
              className="py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold border border-white/10 flex items-center justify-center gap-1.5 transition-all"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Change Map</span>
            </button>
            <button
              onClick={onMainMenu}
              className="py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold border border-white/10 flex items-center justify-center gap-1.5 transition-all"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
