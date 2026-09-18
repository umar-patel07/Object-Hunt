import React, { useEffect } from 'react';
import { MapType } from '../types';
import { Play, Users, MapPin, HelpCircle, Settings, Sparkles, ShieldAlert, ArrowRight } from 'lucide-react';
import { soundManager } from '../game/audio/SoundManager';

interface MainMenuProps {
  playerCount: number;
  selectedMap: MapType;
  onSetPlayerCount: (count: number) => void;
  onSelectMap: (map: MapType) => void;
  onStartGame: () => void;
  onOpenPlayerSetup: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  playerCount,
  selectedMap,
  onSetPlayerCount,
  onSelectMap,
  onStartGame,
  onOpenPlayerSetup,
  onOpenHowToPlay,
  onOpenSettings,
}) => {
  // Listen for Enter / Space key to start immediately from anywhere in menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        // Prevent default space scroll
        e.preventDefault();
        soundManager.playClick();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame]);

  const handleStart = () => {
    soundManager.playClick();
    onStartGame();
  };

  const MAP_OPTIONS = [
    {
      id: 'bedroom' as MapType,
      title: 'Cozy Bedroom',
      subtitle: 'Nightstand, desk, bed & toys',
      color: 'from-amber-700/60 to-orange-900/60',
      border: 'border-amber-500',
      badge: 'Bedroom',
    },
    {
      id: 'garden' as MapType,
      title: 'Garden Patio',
      subtitle: 'Deck, sofa, umbrella & flowers',
      color: 'from-emerald-800/60 to-teal-900/60',
      border: 'border-emerald-500',
      badge: 'Garden',
    },
    {
      id: 'supermarket' as MapType,
      title: 'Supermarket',
      subtitle: 'Grocery shelves & checkout',
      color: 'from-blue-800/60 to-indigo-950/60',
      border: 'border-blue-500',
      badge: 'Supermarket',
    },
  ];

  return (
    <div className="relative min-h-full w-full flex flex-col items-center justify-between p-3 sm:p-6 pb-28 bg-gradient-to-b from-[#181926] via-[#1e2030] to-[#12131d] text-white select-none font-sans">
      {/* Background ambient glow circles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with version, actions & quick play button */}
      <div className="w-full max-w-5xl flex items-center justify-between text-xs font-semibold text-white/70 tracking-wider mb-3">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-white/50">AUTHOR: UMAR PATEL</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenHowToPlay}
            className="hover:text-amber-400 transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">HOW TO PLAY</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="hover:text-white transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer"
          >
            <Settings className="w-4 h-4 text-white/70" />
            <span className="hidden sm:inline">SETTINGS</span>
          </button>

          {/* Quick Start in Header */}
          <button
            onClick={handleStart}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-xs shadow-md border border-amber-300/60 active:scale-95 transition-all cursor-pointer font-['Fredoka']"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>PLAY NOW</span>
          </button>
        </div>
      </div>

      {/* Hero Title & Logo Section */}
      <div className="flex flex-col items-center text-center my-2 sm:my-3 max-w-2xl">
        {/* Stylized Logo Banner */}
        <div className="relative mb-2">
          <div className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 border-3 sm:border-4 border-amber-300/80 shadow-[0_0_35px_rgba(245,158,11,0.5)] transform -rotate-1">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] font-['Fredoka'] uppercase leading-none">
              HIDE &amp; SEEK
            </h1>
            <div className="text-lg sm:text-2xl font-extrabold text-amber-200 tracking-wider uppercase drop-shadow mt-0.5">
              OBJECT WORLD
            </div>
          </div>
        </div>

        {/* Taglines */}
        <div className="inline-block px-4 py-1 rounded-full bg-black/60 border border-amber-500/30 text-amber-300 font-extrabold text-xs sm:text-sm tracking-widest uppercase shadow-md mb-1.5">
          BECOME AN OBJECT. BLEND IN. SURVIVE.
        </div>
        <p className="text-white/70 text-xs sm:text-sm max-w-lg font-medium leading-normal px-2">
          Blend into the environment as everyday props — boxes, plants, chairs &amp; lamps.
          Survive the seeker or hunt them down with the flashlight!
        </p>
      </div>

      {/* Main Options Grid */}
      <div className="w-full max-w-4xl flex flex-col gap-3 sm:gap-4 my-2">
        {/* 1. Player Count Selection */}
        <div className="flex flex-col gap-2 p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-extrabold text-sm sm:text-base">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              <span>SELECT NUMBER OF PLAYERS</span>
            </div>
            <span className="text-xs text-amber-300 font-bold">
              {playerCount === 2
                ? '1 Seeker vs 1 Hider'
                : `1 Seeker vs ${playerCount - 1} Hiders`}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {[2, 3, 4, 5].map((count) => {
              const isSelected = playerCount === count;
              return (
                <button
                  key={count}
                  onClick={() => {
                    soundManager.playClick();
                    onSetPlayerCount(count);
                  }}
                  className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all duration-150 active:scale-95 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/30 border-amber-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-[1.02] ring-1 ring-amber-400'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="text-xl sm:text-2xl font-black">{count} PLAYERS</span>
                  <div className="flex items-center gap-1 mt-0.5 text-[11px] font-semibold text-white/75">
                    <ShieldAlert className="w-3 h-3 text-red-400" />
                    <span>1 Seeker</span>
                    <span>&bull;</span>
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>{count - 1} Hiders</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Map Selection */}
        <div className="flex flex-col gap-2 p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-extrabold text-sm sm:text-base">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              <span>SELECT ENVIRONMENT MAP</span>
            </div>
            <span className="text-xs text-blue-300 font-bold uppercase tracking-wider">
              {selectedMap}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            {MAP_OPTIONS.map((map) => {
              const isSelected = selectedMap === map.id;
              return (
                <button
                  key={map.id}
                  onClick={() => {
                    soundManager.playClick();
                    onSelectMap(map.id);
                  }}
                  className={`flex flex-col p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border text-left transition-all duration-150 active:scale-95 bg-gradient-to-br ${map.color} cursor-pointer ${
                    isSelected
                      ? `ring-2 ring-white ${map.border} shadow-[0_0_20px_rgba(255,255,255,0.25)] scale-[1.02]`
                      : 'border-white/15 opacity-75 hover:opacity-100 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base sm:text-lg font-black text-white">{map.title}</span>
                    {isSelected && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-400 text-black uppercase">
                        SELECTED
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-white/80 font-medium mt-0.5">{map.subtitle}</span>
                  <div className="mt-2 flex items-center justify-between text-[11px] font-bold">
                    <span className="px-2 py-0.5 rounded bg-black/40 text-white/90">
                      {isSelected ? '✓ READY TO PLAY' : 'CLICK TO SELECT'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Inline Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 my-3 w-full max-w-md">
        <button
          onClick={handleStart}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-white font-black text-lg sm:text-xl tracking-wider shadow-[0_0_30px_rgba(245,158,11,0.5)] border-2 border-amber-300 flex items-center justify-center gap-2.5 transition-all cursor-pointer font-['Fredoka'] animate-pulse hover:animate-none"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>START GAME</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            onOpenPlayerSetup();
          }}
          className="w-full py-3 px-5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs sm:text-sm tracking-wide border border-white/20 shadow-xl backdrop-blur-md flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Users className="w-4 h-4 text-amber-300" />
          <span>PLAYERS &amp; ROLES</span>
        </button>
      </div>

      {/* Tagline */}
      <div className="text-center text-[11px] text-white/40 font-bold uppercase tracking-widest mt-1">
        HIDE IN PLAIN SIGHT &bull; BLEND INTO THE WORLD &bull; PRESS SPACE OR ENTER TO START
      </div>

      {/* Pinned / Floating Bottom Action Bar - ALWAYS VISIBLE REGARDLESS OF SCREEN HEIGHT */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/85 backdrop-blur-md border-t border-white/15 px-4 py-2.5 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex flex-col text-left text-xs">
            <span className="font-extrabold text-amber-300 uppercase tracking-wider">
              {playerCount} Players &bull; {selectedMap.toUpperCase()}
            </span>
            <span className="text-[11px] text-white/50">Ready to play</span>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenPlayerSetup();
            }}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 border border-white/15 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Change</span>
            <span>Roles</span>
          </button>
        </div>

        {/* Primary START GAME Button (Pinned, impossible to miss) */}
        <button
          onClick={handleStart}
          className="py-2.5 sm:py-3 px-6 sm:px-10 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-white font-black text-base sm:text-lg tracking-wide shadow-[0_0_25px_rgba(245,158,11,0.6)] border-2 border-amber-300 flex items-center justify-center gap-2 cursor-pointer font-['Fredoka']"
        >
          <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
          <span>START GAME</span>
          <ArrowRight className="w-4 h-4 hidden sm:inline" />
        </button>
      </div>
    </div>
  );
};
