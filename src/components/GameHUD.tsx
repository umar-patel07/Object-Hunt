import React from 'react';
import { MapType, PlayerData, RoundPhase } from '../types';
import { Minimap } from './Minimap';
import { ObjectCarousel } from './ObjectCarousel';
import { PROP_DEFINITIONS } from '../game/models/PropLibrary';
import { Clock, Volume2, VolumeX, Pause, HelpCircle, Settings, ShieldAlert, Sparkles, User, RefreshCw, Eye } from 'lucide-react';

interface GameHUDProps {
  phase: RoundPhase;
  timer: number;
  players: PlayerData[];
  activePlayer?: PlayerData;
  mapType: MapType;
  selectedPropIndex: number;
  targetedPropName?: string | null;
  feedbackMessage?: { text: string; type: 'info' | 'success' | 'warning' | 'error' } | null;
  seekerChances?: { chances: number; maxChances: number };
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onOpenSettings: () => void;
  onOpenHowToPlay: () => void;
  onSelectPropIndex: (index: number) => void;
  onPrevProp: () => void;
  onNextProp: () => void;
  onTransform: () => void;
  onRevert: () => void;
  onTaunt: () => void;
  onInspect: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  phase,
  timer,
  players,
  activePlayer,
  mapType,
  selectedPropIndex,
  targetedPropName,
  feedbackMessage,
  seekerChances = { chances: 3, maxChances: 3 },
  isMuted,
  onToggleMute,
  onPause,
  onOpenSettings,
  onOpenHowToPlay,
  onSelectPropIndex,
  onPrevProp,
  onNextProp,
  onTransform,
  onRevert,
  onTaunt,
  onInspect,
}) => {
  const isSeeker = activePlayer?.role === 'SEEKER';
  const isHider = activePlayer?.role === 'HIDER';
  const isTransformed = isHider && !!activePlayer?.currentPropId;

  // Format timer MM:SS
  const mins = Math.floor(timer / 60);
  const secs = timer % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const currentPropDef = activePlayer?.currentPropId
    ? PROP_DEFINITIONS.find((p) => p.id === activePlayer.currentPropId)
    : null;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none font-sans overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex items-start justify-between w-full">
        {/* Top Left: Logo / Controls & Sound */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={onPause}
              title="Pause Game"
              className="p-2.5 rounded-xl bg-black/70 hover:bg-black/90 active:scale-95 text-white border border-white/10 shadow-lg backdrop-blur-md transition-all"
            >
              <Pause className="w-5 h-5" />
            </button>
            <button
              onClick={onToggleMute}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              className="p-2.5 rounded-xl bg-black/70 hover:bg-black/90 active:scale-95 text-white border border-white/10 shadow-lg backdrop-blur-md transition-all"
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-green-400" />}
            </button>
            <button
              onClick={onOpenHowToPlay}
              title="How to Play"
              className="p-2.5 rounded-xl bg-black/70 hover:bg-black/90 active:scale-95 text-white border border-white/10 shadow-lg backdrop-blur-md transition-all"
            >
              <HelpCircle className="w-5 h-5 text-amber-400" />
            </button>
            <button
              onClick={onOpenSettings}
              title="Settings"
              className="p-2.5 rounded-xl bg-black/70 hover:bg-black/90 active:scale-95 text-white border border-white/10 shadow-lg backdrop-blur-md transition-all"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* Role badge */}
          <div className="flex items-center gap-2 mt-1">
            <div
              className={`px-3 py-1 rounded-xl font-extrabold text-xs uppercase tracking-wider shadow-lg backdrop-blur-md border flex items-center gap-1.5 ${
                isSeeker
                  ? 'bg-red-600/80 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                  : 'bg-emerald-600/80 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              }`}
            >
              {isSeeker ? <ShieldAlert className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              <span>YOU ARE {activePlayer?.role}</span>
              <span className="opacity-75 text-[10px]">({activePlayer?.name})</span>
            </div>
          </div>
        </div>

        {/* Top Center: Round Timer & 3-Chances Meter */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-black/85 border-2 border-white/20 shadow-2xl backdrop-blur-md">
            <Clock className="w-6 h-6 text-amber-400 animate-pulse" />
            <span className="font-mono font-black text-2xl sm:text-3xl text-white tracking-widest">
              {timeFormatted}
            </span>
          </div>

          <div className="mt-1 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-md border">
            {phase === 'PREPARATION' ? (
              <span className="bg-amber-500/20 text-amber-300 border-amber-500/40">
                Preparation Phase &bull; Seeker Blinded
              </span>
            ) : (
              <span className="bg-red-500/20 text-red-300 border-red-500/40">
                Seeking Phase &bull; Hunt In Progress
              </span>
            )}
          </div>

          {/* 3-Chances Rule Badge */}
          <div className="mt-1.5 flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-black/85 border border-white/20 shadow-xl backdrop-blur-md">
            <span className="text-[10px] font-black uppercase tracking-wider text-white/70">
              {isSeeker ? 'Your Chances:' : 'Seeker Chances:'}
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((slot) => {
                const isAvailable = (seekerChances?.chances ?? 3) >= slot;
                return (
                  <div
                    key={slot}
                    className={`px-1.5 py-0.5 rounded-md text-[11px] font-black flex items-center gap-1 border transition-all ${
                      isAvailable
                        ? 'bg-emerald-500/30 text-emerald-300 border-emerald-400/60 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                        : 'bg-red-500/25 text-red-400 border-red-500/40 opacity-50 line-through'
                    }`}
                  >
                    <span>{isAvailable ? '🎯' : '❌'}</span>
                    <span className="text-[9px]">#{slot}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Right: Player Status List (Exact match to reference screenshots!) */}
        <div className="flex flex-col items-end pointer-events-auto">
          <div className="w-48 sm:w-56 p-2.5 rounded-2xl bg-black/80 backdrop-blur-md border border-white/15 shadow-2xl">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10">
              <span className="text-white font-extrabold text-xs tracking-wider">
                PLAYERS ({players.filter((p) => p.state !== 'DISCOVERED' && p.role === 'HIDER').length + 1}/{players.length})
              </span>
              <span className="text-[10px] text-white/50 uppercase font-semibold">Status</span>
            </div>

            <div className="flex flex-col gap-1.5">
              {players.map((p, idx) => {
                const isThisPlayerSeeker = p.role === 'SEEKER';
                const isDiscovered = p.state === 'DISCOVERED';
                const isCurrentTransformed = p.state === 'TRANSFORMED';

                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                      p.id === activePlayer?.id ? 'ring-1 ring-white/50 bg-white/10' : 'bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className="px-1 py-0.2 rounded text-[10px] font-black text-black"
                        style={{ backgroundColor: p.color }}
                      >
                        P{idx + 1}
                      </span>
                      <span className={`truncate ${isDiscovered ? 'line-through text-white/40' : 'text-white'}`}>
                        {p.name}
                      </span>
                    </div>

                    <div>
                      {isThisPlayerSeeker ? (
                        <span className="text-red-400 font-extrabold text-[11px] flex items-center gap-1">
                          Seeker
                        </span>
                      ) : isDiscovered ? (
                        <span className="text-red-500/80 font-semibold text-[11px]">Caught</span>
                      ) : isCurrentTransformed ? (
                        <span className="text-cyan-400 font-semibold text-[11px]">Hidden</span>
                      ) : (
                        <span className="text-emerald-400 font-semibold text-[11px]">Hiding</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Center Feedback Toast */}
      {feedbackMessage && (
        <div className="self-center flex items-center justify-center animate-bounce">
          <div
            className={`px-5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md border text-sm sm:text-base font-extrabold flex items-center gap-2 ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-600/90 border-emerald-400 text-white'
                : feedbackMessage.type === 'warning'
                ? 'bg-amber-600/90 border-amber-400 text-white'
                : feedbackMessage.type === 'error'
                ? 'bg-red-600/90 border-red-400 text-white'
                : 'bg-blue-600/90 border-blue-400 text-white'
            }`}
          >
            <span>{feedbackMessage.text}</span>
          </div>
        </div>
      )}

      {/* Seeker Waiting Screen during 20s Preparation Phase */}
      {isSeeker && phase === 'PREPARATION' && (
        <div className="self-center flex flex-col items-center gap-3 p-6 rounded-3xl bg-black/90 backdrop-blur-xl border border-white/20 shadow-2xl max-w-md text-center pointer-events-auto">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-3xl">
            🙈
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-white font-black text-lg tracking-wide uppercase">
              Hiding Phase in Progress ({timer}s)
            </span>
            <p className="text-white/70 text-xs leading-relaxed">
              The hiders have 20 seconds to disperse and disguise themselves. Your movement and vision are locked until time is up!
            </p>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden mt-1">
            <div
              className="bg-red-500 h-full transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, (timer / 20) * 100))}%` }}
            />
          </div>
        </div>
      )}

      {/* Seeker Target Interaction Prompt in Center (Accuse Object as Hider) */}
      {isSeeker && phase === 'SEEKING' && targetedPropName && (
        <div className="self-center pointer-events-auto cursor-pointer animate-in fade-in duration-200" onClick={onInspect}>
          <div className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 border-2 border-white shadow-[0_0_30px_rgba(239,68,68,0.6)] backdrop-blur-md flex items-center gap-4 active:scale-95 transition-all">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center border border-white/30 text-white">
              <Eye className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <span className="text-white font-black text-base tracking-wide">
                  Do you want to check this {targetedPropName}?
                </span>
                <span className="px-2 py-0.5 rounded bg-black/40 text-amber-300 font-mono text-xs font-bold border border-amber-300/40">
                  [E] or Click
                </span>
              </div>
              <span className="text-amber-100 text-xs font-medium">
                Accuse: &ldquo;This {targetedPropName} is a hider!&rdquo; &bull; ⚠️ {seekerChances?.chances ?? 3}/3 chances remaining
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Row */}
      <div className="flex items-end justify-between w-full">
        {/* Bottom Left: Current Form Card (Matches reference image 2!) */}
        <div className="flex flex-col gap-2">
          {isHider && (
            <div className="p-3 rounded-2xl bg-black/80 backdrop-blur-md border border-white/20 shadow-2xl flex flex-col gap-1 w-44 pointer-events-auto">
              <span className="text-[10px] font-extrabold uppercase text-white/50 tracking-wider">
                CURRENT FORM
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/15 text-amber-400">
                  {isTransformed ? <Sparkles className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-black text-sm leading-tight">
                    {currentPropDef ? currentPropDef.name : 'Human Form'}
                  </span>
                  <span className="text-[11px] text-white/60">
                    {isTransformed ? 'Disguised Prop' : 'Searching for spot'}
                  </span>
                </div>
              </div>

              {isTransformed && (
                <button
                  onClick={onRevert}
                  className="mt-1.5 w-full py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-xs border border-red-500/30 flex items-center justify-center gap-1 active:scale-95 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Form [R]</span>
                </button>
              )}
            </div>
          )}

          {/* Taunt Button for Hider */}
          {isHider && (
            <button
              onClick={onTaunt}
              disabled={(activePlayer?.tauntCooldown || 0) > 0}
              className={`px-4 py-2 rounded-xl font-bold text-xs shadow-lg backdrop-blur-md border flex items-center gap-2 pointer-events-auto active:scale-95 transition-all ${
                (activePlayer?.tauntCooldown || 0) > 0
                  ? 'bg-white/10 border-white/10 text-white/40 cursor-not-allowed'
                  : 'bg-indigo-600/80 hover:bg-indigo-600 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {(activePlayer?.tauntCooldown || 0) > 0
                  ? `Whistle Taunt (${Math.ceil(activePlayer!.tauntCooldown)}s)`
                  : 'Whistle Taunt [T]'}
              </span>
            </button>
          )}
        </div>

        {/* Bottom Center: Object Carousel (Only for Hider when active) */}
        {isHider && (
          <div className="flex flex-col items-center">
            <ObjectCarousel
              selectedIndex={selectedPropIndex}
              onSelect={onSelectPropIndex}
              onPrev={onPrevProp}
              onNext={onNextProp}
              onTransform={onTransform}
            />
          </div>
        )}

        {/* Bottom Right: Keybinds overlay & Minimap */}
        <div className="flex items-end gap-3 pointer-events-auto">
          {/* Quick controls help pill */}
          <div className="hidden md:flex flex-col gap-1 p-2.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-white/75 text-[11px] font-medium shadow-xl">
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 rounded bg-white/15 text-white font-bold font-mono">WASD</kbd>
              <span>Move</span>
            </div>
            {isSeeker ? (
              <>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/15 text-white font-bold font-mono">Click / E</kbd>
                  <span>Inspect Object</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/15 text-white font-bold font-mono">Shift</kbd>
                  <span>Sprint</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/15 text-white font-bold font-mono">E</kbd>
                  <span>Transform</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/15 text-white font-bold font-mono">Q / E</kbd>
                  <span>Change Object</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/15 text-white font-bold font-mono">R</kbd>
                  <span>Reset Form</span>
                </div>
              </>
            )}
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 rounded bg-white/15 text-white font-bold font-mono">Mouse</kbd>
              <span>Orbit Camera</span>
            </div>
          </div>

          <Minimap activePlayer={activePlayer} mapType={mapType} />
        </div>
      </div>
    </div>
  );
};
