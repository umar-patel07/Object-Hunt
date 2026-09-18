export type PlayerRole = 'SEEKER' | 'HIDER';

export type PlayerState =
  | 'WAITING'
  | 'SEARCHING_FOR_HIDING_SPOT'
  | 'TRANSFORMED'
  | 'HIDDEN'
  | 'MOVING_TRANSFORMED'
  | 'DISCOVERED'
  | 'ELIMINATED'
  | 'ROUND_COMPLETE';

export type RoundPhase =
  | 'SETUP'
  | 'PREPARATION'
  | 'SEEKING'
  | 'ROUND_CONCLUSION'
  | 'RESULTS';

export type MapType = 'bedroom' | 'garden' | 'supermarket';

export interface PropDefinition {
  id: string;
  name: string;
  category: 'small' | 'medium' | 'large';
  speedMultiplier: number;
  width: number;
  height: number;
  depth: number;
  description: string;
  iconName: string;
}

export interface PlayerData {
  id: string;
  name: string;
  color: string;
  role: PlayerRole;
  state: PlayerState;
  isBot: boolean;
  score: number;
  currentPropId: string | null;
  position: [number, number, number];
  rotation: number;
  discoveredBy?: string;
  survivalTime: number; // in seconds
  tauntCooldown: number;
  isInspecting?: boolean;
  caughtOrder?: number;
}

export interface GameSettings {
  prepTime: number; // seconds (e.g., 20)
  roundTime: number; // seconds (e.g., 120)
  maxSeekerAttempts: number; // 3 chances rule
  soundVolume: number;
  musicVolume: number;
  graphicsQuality: 'low' | 'medium' | 'high' | 'ultra';
  shadows: boolean;
}

export interface RoundStats {
  winner: 'SEEKER' | 'HIDERS';
  winReason: 'CAUGHT_ALL' | 'OUT_OF_CHANCES' | 'TIME_EXPIRED';
  seekerName: string;
  seekerId: string;
  discoveredCount: number;
  totalHiders: number;
  survivalTimes: { [playerId: string]: number };
  incorrectInteractions: number;
  seekerChancesLeft: number;
  maxChances: number;
  firstHiderCaughtId: string | null;
  firstHiderCaughtName: string | null;
  nextSeekerId: string;
  nextSeekerName: string;
  roundDuration: number;
  mvpPlayerId: string;
}
