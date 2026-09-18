import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameSettings, MapType, PlayerData, RoundPhase, RoundStats } from './types';
import { PROP_DEFINITIONS } from './game/models/PropLibrary';
import { GameEngine } from './game/engine/GameEngine';
import { soundManager } from './game/audio/SoundManager';
import { MainMenu } from './components/MainMenu';
import { GameHUD } from './components/GameHUD';
import { PlayerSetup } from './components/PlayerSetup';
import { ResultsModal } from './components/ResultsModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';
import { PauseModal } from './components/PauseModal';
import { StaticProp } from './game/map/MapBuilder';

const DEFAULT_SETTINGS: GameSettings = {
  prepTime: 20,
  roundTime: 120,
  maxSeekerAttempts: 5,
  soundVolume: 0.8,
  musicVolume: 0.4,
  graphicsQuality: 'high',
  shadows: true,
};

const DEFAULT_PLAYER_TEMPLATES: PlayerData[] = [
  {
    id: 'p1',
    name: 'Umar',
    color: '#3b82f6',
    role: 'SEEKER',
    state: 'WAITING',
    isBot: false,
    score: 0,
    currentPropId: null,
    position: [0, 0, 0],
    rotation: 0,
    survivalTime: 0,
    tauntCooldown: 0,
  },
  {
    id: 'p2',
    name: 'Riya',
    color: '#10b981',
    role: 'HIDER',
    state: 'SEARCHING_FOR_HIDING_SPOT',
    isBot: true,
    score: 0,
    currentPropId: null,
    position: [0, 0, 0],
    rotation: 0,
    survivalTime: 0,
    tauntCooldown: 0,
  },
  {
    id: 'p3',
    name: 'Kabir',
    color: '#f59e0b',
    role: 'HIDER',
    state: 'SEARCHING_FOR_HIDING_SPOT',
    isBot: true,
    score: 0,
    currentPropId: null,
    position: [0, 0, 0],
    rotation: 0,
    survivalTime: 0,
    tauntCooldown: 0,
  },
  {
    id: 'p4',
    name: 'Sana',
    color: '#a855f7',
    role: 'HIDER',
    state: 'SEARCHING_FOR_HIDING_SPOT',
    isBot: true,
    score: 0,
    currentPropId: null,
    position: [0, 0, 0],
    rotation: 0,
    survivalTime: 0,
    tauntCooldown: 0,
  },
  {
    id: 'p5',
    name: 'Armaan',
    color: '#ec4899',
    role: 'HIDER',
    state: 'SEARCHING_FOR_HIDING_SPOT',
    isBot: true,
    score: 0,
    currentPropId: null,
    position: [0, 0, 0],
    rotation: 0,
    survivalTime: 0,
    tauntCooldown: 0,
  },
];

export default function App() {
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING'>('MENU');
  const [playerCount, setPlayerCount] = useState<number>(5);
  const [selectedMap, setSelectedMap] = useState<MapType>('bedroom');
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [players, setPlayers] = useState<PlayerData[]>(() =>
    DEFAULT_PLAYER_TEMPLATES.slice(0, 5)
  );

  // HUD / Game Runtime State
  const [phase, setPhase] = useState<RoundPhase>('SETUP');
  const [timer, setTimer] = useState<number>(120);
  const [activePlayer, setActivePlayer] = useState<PlayerData | undefined>(players[0]);
  const [selectedPropIndex, setSelectedPropIndex] = useState<number>(0);
  const [targetedProp, setTargetedProp] = useState<StaticProp | null>(null);
  const [feedback, setFeedback] = useState<{
    text: string;
    type: 'info' | 'success' | 'warning' | 'error';
  } | null>(null);
  const [roundStats, setRoundStats] = useState<RoundStats | null>(null);
  const [seekerChances, setSeekerChances] = useState<{ chances: number; maxChances: number }>({ chances: 3, maxChances: 3 });
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Modals
  const [isPlayerSetupOpen, setIsPlayerSetupOpen] = useState<boolean>(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Sync player count changes with players array
  const handleSetPlayerCount = (count: number) => {
    setPlayerCount(count);
    let newPlayers = DEFAULT_PLAYER_TEMPLATES.slice(0, count).map((p, idx) => ({
      ...p,
      role: (idx === 0 ? 'SEEKER' : 'HIDER') as 'SEEKER' | 'HIDER',
    }));
    setPlayers(newPlayers);
  };

  const handleStartGame = () => {
    setGameState('PLAYING');
    setIsPaused(false);
    setRoundStats(null);
  };

  const handleToggleMute = useCallback(() => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  }, []);

  // Initialize GameEngine when container is mounted
  useEffect(() => {
    if (gameState !== 'PLAYING' || !canvasContainerRef.current) return;

    const engine = new GameEngine(canvasContainerRef.current, settings, {
      onPhaseChange: (newPhase) => setPhase(newPhase),
      onTimerTick: (timeRemaining) => setTimer(timeRemaining),
      onPlayersUpdated: (updatedPlayers) => {
        setPlayers([...updatedPlayers]);
        const currActive = engine.getActivePlayer();
        setActivePlayer(currActive ? { ...currActive } : undefined);
      },
      onTargetPropChanged: (prop) => {
        setTargetedProp(prop);
      },
      onRoundComplete: (stats) => {
        setRoundStats(stats);
      },
      onSeekerChancesChanged: (chances, maxChances) => {
        setSeekerChances({ chances, maxChances });
      },
      onFeedbackMessage: (text, type) => {
        setFeedback({ text, type });
        setTimeout(() => {
          setFeedback((prev) => (prev?.text === text ? null : prev));
        }, 3200);
      },
    });

    engineRef.current = engine;
    engine.startNewGame(players, selectedMap);

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [gameState, selectedMap]);

  // Handle settings update
  const handleUpdateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    soundManager.setVolumes(newSettings.soundVolume, newSettings.musicVolume);
  };

  // Next round with Seeker rotation
  const handleNextRound = () => {
    setRoundStats(null);
    setIsPaused(false);
    if (engineRef.current) {
      engineRef.current.startRound(false);
    }
  };

  // Play again on same roles
  const handlePlayAgain = () => {
    setRoundStats(null);
    setIsPaused(false);
    if (engineRef.current) {
      engineRef.current.startRound(true);
    }
  };

  // Switch map and restart
  const handleChangeMap = () => {
    const maps: MapType[] = ['bedroom', 'garden', 'supermarket'];
    const nextMap = maps[(maps.indexOf(selectedMap) + 1) % maps.length];
    setSelectedMap(nextMap);
    setRoundStats(null);
    setIsPaused(false);
  };

  const handleQuitToMenu = () => {
    if (engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
    }
    setGameState('MENU');
    setIsPaused(false);
    setRoundStats(null);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none font-sans">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={canvasContainerRef}
        className={`w-full h-full ${gameState === 'PLAYING' ? 'block' : 'hidden'}`}
      />

      {/* Main Menu Screen */}
      {gameState === 'MENU' && (
        <div className="w-full h-full overflow-y-auto overflow-x-hidden">
          <MainMenu
            playerCount={playerCount}
            selectedMap={selectedMap}
            onSetPlayerCount={handleSetPlayerCount}
            onSelectMap={setSelectedMap}
            onStartGame={handleStartGame}
            onOpenPlayerSetup={() => setIsPlayerSetupOpen(true)}
            onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </div>
      )}

      {/* In-Game HUD */}
      {gameState === 'PLAYING' && !roundStats && (
        <GameHUD
          phase={phase}
          timer={timer}
          players={players}
          activePlayer={activePlayer}
          mapType={selectedMap}
          selectedPropIndex={selectedPropIndex}
          targetedPropName={
            targetedProp
              ? PROP_DEFINITIONS.find((p) => p.id === targetedProp.propType)?.name ||
                targetedProp.propType.replace('_', ' ')
              : null
          }
          feedbackMessage={feedback}
          seekerChances={seekerChances}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onPause={() => setIsPaused(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
          onSelectPropIndex={(idx) => {
            setSelectedPropIndex(idx);
            if (engineRef.current) {
              const delta = idx - selectedPropIndex;
              engineRef.current.changeSelectedProp(delta);
            }
          }}
          onPrevProp={() => {
            if (engineRef.current) {
              engineRef.current.changeSelectedProp(-1);
              setSelectedPropIndex((prev) => (prev - 1 + 9) % 9);
            }
          }}
          onNextProp={() => {
            if (engineRef.current) {
              engineRef.current.changeSelectedProp(1);
              setSelectedPropIndex((prev) => (prev + 1) % 9);
            }
          }}
          onTransform={() => {
            if (engineRef.current && activePlayer) {
              const prop = engineRef.current.getSelectedProp();
              engineRef.current.transformPlayer(activePlayer.id, prop.id);
            }
          }}
          onRevert={() => {
            if (engineRef.current && activePlayer) {
              engineRef.current.revertPlayerForm(activePlayer.id);
            }
          }}
          onTaunt={() => {
            if (engineRef.current) {
              engineRef.current.triggerTaunt();
            }
          }}
          onInspect={() => {
            if (engineRef.current) {
              engineRef.current.inspectTargetProp();
            }
          }}
        />
      )}

      {/* Modals & Overlays */}
      {isPlayerSetupOpen && (
        <PlayerSetup
          players={players}
          onUpdatePlayers={(updated) => {
            setPlayers(updated);
            if (engineRef.current) {
              setPlayers(updated);
            }
          }}
          onConfirmAndPlay={() => {
            setIsPlayerSetupOpen(false);
            handleStartGame();
          }}
          onBack={() => setIsPlayerSetupOpen(false)}
        />
      )}

      {isHowToPlayOpen && <HowToPlayModal onClose={() => setIsHowToPlayOpen(false)} />}

      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {isPaused && (
        <PauseModal
          onResume={() => setIsPaused(false)}
          onRestartRound={() => {
            setIsPaused(false);
            if (engineRef.current) engineRef.current.startRound(true);
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
          onQuitToMenu={handleQuitToMenu}
        />
      )}

      {roundStats && (
        <ResultsModal
          stats={roundStats}
          players={players}
          onNextRound={handleNextRound}
          onPlayAgain={handlePlayAgain}
          onChangeMap={handleChangeMap}
          onMainMenu={handleQuitToMenu}
        />
      )}
    </div>
  );
}
