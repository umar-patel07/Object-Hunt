import * as THREE from 'three';
import { GameSettings, MapType, PlayerData, RoundPhase, RoundStats } from '../../types';
import { CharacterControllerMesh } from '../models/CharacterModel';
import { createPropMesh, createPreviewMesh, PROP_DEFINITIONS } from '../models/PropLibrary';
import { MapBuilder, MapData, StaticProp } from '../map/MapBuilder';
import { CollisionSystem } from '../physics/CollisionSystem';
import { BotController } from '../ai/BotController';
import { soundManager } from '../audio/SoundManager';
import confetti from 'canvas-confetti';

export interface GameEngineCallbacks {
  onPhaseChange: (phase: RoundPhase) => void;
  onTimerTick: (timeRemaining: number) => void;
  onPlayersUpdated: (players: PlayerData[]) => void;
  onTargetPropChanged: (prop: StaticProp | null, canTransform: boolean) => void;
  onRoundComplete: (stats: RoundStats) => void;
  onFeedbackMessage: (msg: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  onSeekerChancesChanged: (chances: number, maxChances: number) => void;
}

export class GameEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animFrameId: number | null = null;
  private clock: THREE.Clock;

  // Map & Environment
  private mapType: MapType = 'bedroom';
  private mapData: MapData | null = null;

  // Players & Objects
  private players: PlayerData[] = [];
  private playerMeshes: Map<string, THREE.Group> = new Map();
  private playerControllers: Map<string, CharacterControllerMesh> = new Map();
  private transformedPropMeshes: Map<string, THREE.Group> = new Map();
  private activePlayerId: string = '';

  // Transform Preview
  private previewMesh: THREE.Group | null = null;
  private selectedPropIndex: number = 0;

  // Camera Controls
  private cameraTarget: THREE.Vector3 = new THREE.Vector3();
  private cameraAngle: { yaw: number; pitch: number } = { yaw: 0, pitch: 0.35 };
  private cameraDistance: number = 5.0;
  private isMouseDown: boolean = false;
  private mousePrevPos: { x: number; y: number } = { x: 0, y: 0 };

  // Game Loop & Rules
  private phase: RoundPhase = 'SETUP';
  private roundTimer: number = 120;
  private prepTimer: number = 20;
  private settings: GameSettings;
  private callbacks: GameEngineCallbacks;
  private botController: BotController = new BotController();

  // Seeker 3-chances and rotation rules
  private maxChances: number = 3;
  private seekerChances: number = 3;
  private firstHiderCaughtId: string | null = null;
  private firstHiderCaughtName: string | null = null;
  private pendingNextSeekerId: string | null = null;
  private incorrectInspections: number = 0;
  private roundStartTime: number = 0;
  private targetedProp: StaticProp | null = null;
  private inspectCooldown: number = 0;

  // Movement physics & animation improvements
  private playerVelocity: THREE.Vector3 = new THREE.Vector3();
  private propMoveTime: number = 0;
  private footstepTimer: number = 0;

  // Input
  private keysPressed: Set<string> = new Set();

  constructor(container: HTMLElement, settings: GameSettings, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.settings = settings;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1c23);
    this.scene.fog = new THREE.FogExp2(0x1a1c23, 0.025);

    // Camera
    const aspect = container.clientWidth / (container.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 100);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = settings.shadows;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    container.appendChild(this.renderer.domElement);

    this.setupEventListeners();
    this.setupResizeObserver();
  }

  // --- Initialization & Round Flow ---

  public startNewGame(players: PlayerData[], map: MapType) {
    this.players = [...players];
    this.mapType = map;
    this.loadMap(map);
    this.startRound(true);
    this.animate();
  }

  public loadMap(map: MapType) {
    // Clean old map
    if (this.mapData) {
      this.scene.remove(this.mapData.group);
      this.mapData.lights.forEach((l) => this.scene.remove(l));
    }

    this.mapType = map;
    this.mapData = MapBuilder.buildMap(map);
    this.scene.add(this.mapData.group);
    this.scene.background = new THREE.Color(this.mapData.ambientColor).lerp(new THREE.Color(0x111115), 0.7);
    this.scene.fog = new THREE.FogExp2(this.scene.background.getHex(), 0.02);
  }

  public startRound(isFirstRound: boolean = false) {
    if (!this.mapData) return;

    // Seeker Rotation logic
    if (!isFirstRound) {
      if (this.pendingNextSeekerId) {
        // Designate next seeker based on previous round outcome
        const nextId = this.pendingNextSeekerId;
        this.players.forEach((p) => {
          p.role = p.id === nextId ? 'SEEKER' : 'HIDER';
        });
        const newSeeker = this.players.find((p) => p.id === nextId);
        if (newSeeker) {
          this.callbacks.onFeedbackMessage(
            `Round Starting! Seeker is ${newSeeker.name}!`,
            'info'
          );
        }
      } else {
        this.rotateSeeker();
      }
    }

    // Reset player states & transforms
    this.clearAllPlayerMeshes();
    this.botController.reset();
    this.incorrectInspections = 0;
    this.prepTimer = this.settings.prepTime;
    this.roundTimer = this.settings.roundTime;
    this.phase = 'PREPARATION';
    this.roundStartTime = performance.now();

    // Reset Seeker 3-chances rule
    this.maxChances = 3;
    this.seekerChances = 3;
    this.firstHiderCaughtId = null;
    this.firstHiderCaughtName = null;
    this.pendingNextSeekerId = null;
    this.playerVelocity.set(0, 0, 0);
    this.callbacks.onSeekerChancesChanged(this.seekerChances, this.maxChances);

    // Spawn players
    const seeker = this.players.find((p) => p.role === 'SEEKER') || this.players[0];
    const hiders = this.players.filter((p) => p.id !== seeker.id);

    // Seeker setup
    seeker.role = 'SEEKER';
    seeker.state = 'WAITING';
    seeker.currentPropId = null;
    seeker.survivalTime = 0;
    seeker.position = [this.mapData.seekerSpawn.x, 0, this.mapData.seekerSpawn.z];
    seeker.rotation = 0;

    // Hiders setup
    hiders.forEach((hider, idx) => {
      hider.role = 'HIDER';
      hider.state = 'SEARCHING_FOR_HIDING_SPOT';
      hider.currentPropId = null;
      hider.survivalTime = 0;
      hider.discoveredBy = undefined;
      hider.caughtOrder = undefined;
      const spawn = this.mapData!.hiderSpawns[idx % this.mapData!.hiderSpawns.length];
      hider.position = [spawn.x, 0, spawn.z];
      hider.rotation = 0;
    });

    // Pick active player to control (first human player, or seeker)
    const human = this.players.find((p) => !p.isBot);
    this.activePlayerId = human ? human.id : seeker.id;

    // Create 3D avatars
    this.players.forEach((p) => this.spawnCharacterMesh(p));

    // Update preview mesh for active player if hider
    this.updatePreviewMesh();

    soundManager.startAmbientMusic();
    soundManager.playCountdownTick(true);

    this.callbacks.onPhaseChange(this.phase);
    this.callbacks.onPlayersUpdated([...this.players]);
    this.callbacks.onFeedbackMessage(
      `Round Started! Prep Phase (${this.prepTimer}s). Seeker has 3 chances to find all hiders!`,
      'info'
    );
  }

  private rotateSeeker() {
    // Fallback rotation: move seeker role to next player index
    const currentSeekerIndex = this.players.findIndex((p) => p.role === 'SEEKER');
    const nextSeekerIndex = (currentSeekerIndex + 1) % this.players.length;

    this.players.forEach((p, idx) => {
      if (idx === nextSeekerIndex) {
        p.role = 'SEEKER';
      } else {
        p.role = 'HIDER';
      }
    });

    this.callbacks.onFeedbackMessage(`Seeker rotated! Next Seeker is ${this.players[nextSeekerIndex].name}!`, 'info');
  }

  // --- 3D Character & Prop Mesh Spawning ---

  private spawnCharacterMesh(player: PlayerData) {
    const isSeeker = player.role === 'SEEKER';
    const controller = new CharacterControllerMesh({
      color: player.color,
      isSeeker,
      name: player.name,
    });

    controller.group.position.set(...player.position);
    controller.group.rotation.y = player.rotation;
    this.scene.add(controller.group);

    this.playerMeshes.set(player.id, controller.group);
    this.playerControllers.set(player.id, controller);

    // If seeker and this is local human playing as Hider, seeker indicator is visible or vice versa
    const activePlayer = this.getActivePlayer();
    if (activePlayer && activePlayer.role === 'SEEKER' && !isSeeker) {
      controller.setIndicatorVisible(false); // Seeker can't see hider name floating above them!
    }
  }

  private clearAllPlayerMeshes() {
    this.playerMeshes.forEach((mesh) => this.scene.remove(mesh));
    this.playerMeshes.clear();
    this.playerControllers.clear();

    this.transformedPropMeshes.forEach((mesh) => this.scene.remove(mesh));
    this.transformedPropMeshes.clear();

    if (this.previewMesh) {
      this.scene.remove(this.previewMesh);
      this.previewMesh = null;
    }

    // Clean any player props from interactables
    if (this.mapData) {
      this.mapData.interactableProps = this.mapData.interactableProps.filter((p) => !p.isPlayerProp);
    }
  }

  // --- Transformation Logic ---

  public transformPlayer(playerId: string, propId: string) {
    const player = this.players.find((p) => p.id === playerId);
    if (!player || player.role !== 'HIDER' || player.state === 'DISCOVERED') return;

    // Check bounds & valid position
    const currentPos = new THREE.Vector3(...player.position);

    // Hide or remove character model
    const charGroup = this.playerMeshes.get(playerId);
    if (charGroup) {
      charGroup.visible = false;
    }

    // Remove old transformed prop mesh if any
    const oldProp = this.transformedPropMeshes.get(playerId);
    if (oldProp) {
      this.scene.remove(oldProp);
      this.transformedPropMeshes.delete(playerId);
    }

    // Spawn new prop mesh
    const propMesh = createPropMesh(propId);
    propMesh.position.copy(currentPos);
    propMesh.rotation.y = player.rotation;
    this.scene.add(propMesh);
    this.transformedPropMeshes.set(playerId, propMesh);

    // Register with map interactables as a player prop
    const propBounds = new THREE.Box3().setFromObject(propMesh);
    const staticProp: StaticProp = {
      id: `player_prop_${playerId}`,
      propType: propId,
      mesh: propMesh,
      bounds: propBounds,
      isPlayerProp: true,
      playerId,
    };

    if (this.mapData) {
      // Remove any prior entry for this player
      this.mapData.interactableProps = this.mapData.interactableProps.filter((p) => p.playerId !== playerId);
      this.mapData.interactableProps.push(staticProp);
    }

    player.currentPropId = propId;
    player.state = 'TRANSFORMED';

    soundManager.playTransform();
    this.createPuffParticles(currentPos);

    if (playerId === this.activePlayerId) {
      this.callbacks.onFeedbackMessage(`Transformed into ${propId.toUpperCase()}! Blend in and stay still.`, 'success');
      this.updatePreviewMesh();
    }
    this.callbacks.onPlayersUpdated([...this.players]);
  }

  public revertPlayerForm(playerId: string) {
    const player = this.players.find((p) => p.id === playerId);
    if (!player || player.role !== 'HIDER') return;

    // Remove prop
    const propMesh = this.transformedPropMeshes.get(playerId);
    if (propMesh) {
      this.scene.remove(propMesh);
      this.transformedPropMeshes.delete(playerId);
    }

    if (this.mapData) {
      this.mapData.interactableProps = this.mapData.interactableProps.filter((p) => p.playerId !== playerId);
    }

    // Show character
    const charGroup = this.playerMeshes.get(playerId);
    if (charGroup) {
      charGroup.visible = true;
    }

    player.currentPropId = null;
    player.state = 'SEARCHING_FOR_HIDING_SPOT';

    soundManager.playTransform();
    this.createPuffParticles(new THREE.Vector3(...player.position));

    if (playerId === this.activePlayerId) {
      this.callbacks.onFeedbackMessage('Reverted to character form!', 'info');
      this.updatePreviewMesh();
    }
    this.callbacks.onPlayersUpdated([...this.players]);
  }

  // --- Discovery Logic (3-Chances Accusation Rule) ---

  public inspectTargetProp() {
    const activePlayer = this.getActivePlayer();
    if (!activePlayer || activePlayer.role !== 'SEEKER' || this.phase !== 'SEEKING') return;
    if (this.seekerChances <= 0) return;

    if (this.inspectCooldown > 0) return;
    this.inspectCooldown = 0.5;

    soundManager.playInspectClick();

    if (!this.targetedProp) {
      // Swung at air
      return;
    }

    if (this.targetedProp.isPlayerProp && this.targetedProp.playerId) {
      // SUCCESS! HIDER DISCOVERED!
      const hider = this.players.find((p) => p.id === this.targetedProp!.playerId);
      if (hider && hider.state !== 'DISCOVERED') {
        hider.state = 'DISCOVERED';
        hider.discoveredBy = activePlayer.name;
        hider.survivalTime = Math.round((performance.now() - this.roundStartTime) / 1000);

        // Record first caught hider! (Rules: First caught hider will be next seeker if all are caught)
        if (this.firstHiderCaughtId === null) {
          this.firstHiderCaughtId = hider.id;
          this.firstHiderCaughtName = hider.name;
          hider.caughtOrder = 1;
        } else {
          const caughtSoFar = this.players.filter((p) => p.state === 'DISCOVERED').length;
          hider.caughtOrder = caughtSoFar;
        }

        // Visual celebration
        soundManager.playDiscovery();
        confetti({ particleCount: 65, spread: 70, origin: { y: 0.6 } });

        // Revert hider to character form and mark discovered
        this.revertPlayerForm(hider.id);

        const remainingHiders = this.players.filter((p) => p.role === 'HIDER' && p.state !== 'DISCOVERED');
        if (remainingHiders.length > 0) {
          this.callbacks.onFeedbackMessage(
            `🎯 BUSTED! ${hider.name} was caught! ${remainingHiders.length} hider${remainingHiders.length > 1 ? 's' : ''} left! (Chances: ${this.seekerChances}/${this.maxChances})`,
            'success'
          );
        } else {
          this.callbacks.onFeedbackMessage(
            `🏆 VICTORY! All hiders discovered within ${this.maxChances} chances!`,
            'success'
          );
        }
        this.callbacks.onPlayersUpdated([...this.players]);

        // Check Win Condition: Did Seeker find all Hiders?
        if (remainingHiders.length === 0) {
          this.endRound('SEEKER', 'CAUGHT_ALL');
        }
      }
    } else {
      // FALSE INTERACTION: Ordinary object! Seeker loses 1 of 3 chances!
      this.incorrectInspections++;
      this.seekerChances = Math.max(0, this.seekerChances - 1);
      this.callbacks.onSeekerChancesChanged(this.seekerChances, this.maxChances);

      soundManager.playLostChance();

      // Wobble feedback on the wrongly accused object
      const mesh = this.targetedProp.mesh;
      const origRot = mesh.rotation.z;
      mesh.rotation.z += 0.22;
      setTimeout(() => {
        mesh.rotation.z = origRot;
      }, 160);

      if (this.seekerChances > 0) {
        this.callbacks.onFeedbackMessage(
          `❌ WRONG ACCUSATION! That's just an ordinary ${this.targetedProp.propType}! ${this.seekerChances}/${this.maxChances} chances left!`,
          'warning'
        );
      } else {
        // Seeker is OUT OF CHANCES!
        soundManager.playSeekerEliminated();
        this.callbacks.onFeedbackMessage(
          `💀 OUT OF CHANCES! The Seeker used all 3 attempts! HIDERS WIN!`,
          'error'
        );
        this.endRound('HIDERS', 'OUT_OF_CHANCES');
      }
    }
  }

  // --- End Round & Calculate Results ---

  private endRound(winner: 'SEEKER' | 'HIDERS', winReason: 'CAUGHT_ALL' | 'OUT_OF_CHANCES' | 'TIME_EXPIRED' = 'TIME_EXPIRED') {
    if (this.phase === 'ROUND_CONCLUSION' || this.phase === 'RESULTS') return;

    this.phase = 'RESULTS';
    soundManager.stopAmbientMusic();
    soundManager.playVictory();

    const seeker = this.players.find((p) => p.role === 'SEEKER') || this.players[0];
    const hiders = this.players.filter((p) => p.role === 'HIDER');
    const discoveredHiders = hiders.filter((p) => p.state === 'DISCOVERED');

    const totalDuration = Math.round((performance.now() - this.roundStartTime) / 1000);

    const survivalTimes: { [id: string]: number } = {};
    hiders.forEach((h) => {
      survivalTimes[h.id] = h.survivalTime > 0 ? h.survivalTime : totalDuration;
    });

    // Seeker Rotation Rule:
    // "and if the seeker find out correctly all so the first hider caught will be the next seeker
    //  if not so the seeker will be the same for the next round also"
    let nextSeekerPlayer: PlayerData;
    if (winner === 'SEEKER' && winReason === 'CAUGHT_ALL') {
      // First hider caught becomes the next seeker
      nextSeekerPlayer =
        this.players.find((p) => p.id === this.firstHiderCaughtId) ||
        discoveredHiders[0] ||
        hiders[0] ||
        seeker;
      this.pendingNextSeekerId = nextSeekerPlayer.id;
    } else {
      // Seeker failed (ran out of chances or time expired) -> Seeker remains the same!
      nextSeekerPlayer = seeker;
      this.pendingNextSeekerId = seeker.id;
    }

    const stats: RoundStats = {
      winner,
      winReason,
      seekerName: seeker.name,
      seekerId: seeker.id,
      discoveredCount: discoveredHiders.length,
      totalHiders: hiders.length,
      survivalTimes,
      incorrectInteractions: this.incorrectInspections,
      seekerChancesLeft: this.seekerChances,
      maxChances: this.maxChances,
      firstHiderCaughtId: this.firstHiderCaughtId,
      firstHiderCaughtName: this.firstHiderCaughtName,
      nextSeekerId: nextSeekerPlayer.id,
      nextSeekerName: nextSeekerPlayer.name,
      roundDuration: totalDuration,
      mvpPlayerId:
        winner === 'SEEKER'
          ? seeker.id
          : hiders.find((h) => h.state !== 'DISCOVERED')?.id || hiders[0]?.id,
    };

    this.callbacks.onPhaseChange(this.phase);
    this.callbacks.onRoundComplete(stats);
  }

  // --- Taunt Ability ---

  public triggerTaunt() {
    const activePlayer = this.getActivePlayer();
    if (!activePlayer || activePlayer.role !== 'HIDER' || activePlayer.state === 'DISCOVERED') return;

    if (activePlayer.tauntCooldown > 0) return;
    activePlayer.tauntCooldown = 6.0; // 6s cooldown

    soundManager.playTaunt();
    this.createSoundWaveEffect(new THREE.Vector3(...activePlayer.position));
    this.callbacks.onFeedbackMessage('Taunt emitted! The seeker heard a whistle!', 'info');
  }

  // --- Carousel / Prop Selection ---

  public changeSelectedProp(delta: number) {
    const total = PROP_DEFINITIONS.length;
    this.selectedPropIndex = (this.selectedPropIndex + delta + total) % total;
    this.updatePreviewMesh();
  }

  public getSelectedProp(): (typeof PROP_DEFINITIONS)[0] {
    return PROP_DEFINITIONS[this.selectedPropIndex];
  }

  private updatePreviewMesh() {
    const activePlayer = this.getActivePlayer();
    if (!activePlayer || activePlayer.role !== 'HIDER' || activePlayer.state === 'DISCOVERED') {
      if (this.previewMesh) {
        this.scene.remove(this.previewMesh);
        this.previewMesh = null;
      }
      return;
    }

    if (this.previewMesh) {
      this.scene.remove(this.previewMesh);
      this.previewMesh = null;
    }

    const prop = this.getSelectedProp();
    this.previewMesh = createPreviewMesh(prop.id);
    this.scene.add(this.previewMesh);
  }

  // --- Game Loop (60 FPS) ---

  private animate = () => {
    this.animFrameId = requestAnimationFrame(this.animate);
    const dt = Math.min(this.clock.getDelta(), 0.1);

    this.updateTimers(dt);
    this.updateControlsAndPhysics(dt);
    this.updateBots(dt);
    this.updateCamera(dt);
    this.updateRaycast();

    this.renderer.render(this.scene, this.camera);
  };

  private updateTimers(dt: number) {
    if (this.inspectCooldown > 0) {
      this.inspectCooldown -= dt;
    }

    // Update taunt cooldowns
    this.players.forEach((p) => {
      if (p.tauntCooldown > 0) p.tauntCooldown -= dt;
    });

    if (this.phase === 'PREPARATION') {
      this.prepTimer -= dt;
      if (Math.ceil(this.prepTimer) !== Math.ceil(this.prepTimer + dt)) {
        if (this.prepTimer <= 5) soundManager.playCountdownTick(this.prepTimer <= 1);
      }

      this.callbacks.onTimerTick(Math.max(0, Math.ceil(this.prepTimer)));

      if (this.prepTimer <= 0) {
        // Switch to SEEKING phase!
        this.phase = 'SEEKING';
        this.callbacks.onPhaseChange(this.phase);
        this.callbacks.onFeedbackMessage('Seeker is RELEASED! Seekers: find the hidden objects!', 'warning');
        soundManager.playCountdownTick(true);
      }
    } else if (this.phase === 'SEEKING') {
      this.roundTimer -= dt;
      if (Math.ceil(this.roundTimer) !== Math.ceil(this.roundTimer + dt)) {
        if (this.roundTimer <= 10) soundManager.playCountdownTick(this.roundTimer <= 3);
      }

      this.callbacks.onTimerTick(Math.max(0, Math.ceil(this.roundTimer)));

      if (this.roundTimer <= 0) {
        // Round timer expired: HIDERS WIN!
        this.endRound('HIDERS');
      }
    }
  }

  private updateControlsAndPhysics(dt: number) {
    const activePlayer = this.getActivePlayer();
    if (!activePlayer || !this.mapData) return;

    // In PREP phase, Seeker cannot move or turn!
    if (this.phase === 'PREPARATION' && activePlayer.role === 'SEEKER') {
      this.playerVelocity.set(0, 0, 0);
      return;
    }

    if (activePlayer.state === 'DISCOVERED') return;

    // Movement Vector
    const moveDir = new THREE.Vector3();
    const isW = this.keysPressed.has('KeyW') || this.keysPressed.has('ArrowUp');
    const isS = this.keysPressed.has('KeyS') || this.keysPressed.has('ArrowDown');
    const isA = this.keysPressed.has('KeyA') || this.keysPressed.has('ArrowLeft');
    const isD = this.keysPressed.has('KeyD') || this.keysPressed.has('ArrowRight');
    const isSprint = this.keysPressed.has('ShiftLeft') || this.keysPressed.has('ShiftRight');

    // Camera-relative forward & right
    const forward = new THREE.Vector3(Math.sin(this.cameraAngle.yaw), 0, Math.cos(this.cameraAngle.yaw)).negate();
    const right = new THREE.Vector3(forward.z, 0, -forward.x).negate();

    if (isW) moveDir.add(forward);
    if (isS) moveDir.sub(forward);
    if (isD) moveDir.add(right);
    if (isA) moveDir.sub(right);

    const isMovingInput = moveDir.lengthSq() > 0.001;
    if (isMovingInput) moveDir.normalize();

    // Base speed
    let targetSpeed = activePlayer.role === 'SEEKER' ? 5.2 : 4.4;
    if (isSprint && activePlayer.role === 'SEEKER') targetSpeed *= 1.4;

    // If transformed, speed is altered by prop size
    if (activePlayer.currentPropId) {
      const propDef = PROP_DEFINITIONS.find((p) => p.id === activePlayer.currentPropId);
      if (propDef) targetSpeed *= propDef.speedMultiplier;
    }

    // Smooth acceleration & friction
    const targetVel = isMovingInput ? moveDir.clone().multiplyScalar(targetSpeed) : new THREE.Vector3(0, 0, 0);
    this.playerVelocity.lerp(targetVel, Math.min(1.0, dt * 13));

    const currentSpeed = this.playerVelocity.length();

    if (currentSpeed > 0.05) {
      const deltaMove = this.playerVelocity.clone().multiplyScalar(dt);
      const currentPos = new THREE.Vector3(...activePlayer.position);

      // Smooth collision with wall-sliding!
      const playerRadius = 0.42;
      const testFull = currentPos.clone().add(deltaMove);
      let nextPos = currentPos.clone();
      let actuallyMoved = false;

      if (!CollisionSystem.checkCollision(testFull, playerRadius, this.mapData.staticColliders)) {
        nextPos = testFull;
        actuallyMoved = true;
      } else {
        // Wall sliding: Try X axis only
        const testX = new THREE.Vector3(currentPos.x + deltaMove.x, 0, currentPos.z);
        if (!CollisionSystem.checkCollision(testX, playerRadius, this.mapData.staticColliders)) {
          nextPos.x = testX.x;
          actuallyMoved = true;
        }
        // Wall sliding: Try Z axis only
        const testZ = new THREE.Vector3(nextPos.x, 0, currentPos.z + deltaMove.z);
        if (!CollisionSystem.checkCollision(testZ, playerRadius, this.mapData.staticColliders)) {
          nextPos.z = testZ.z;
          actuallyMoved = true;
        }
      }

      if (actuallyMoved) {
        const clamped = CollisionSystem.clampToMap(nextPos, playerRadius, this.mapData.mapSize);
        activePlayer.position = [clamped.x, 0, clamped.z];

        // Footstep cadence
        this.footstepTimer += dt * currentSpeed;
        if (this.footstepTimer > 2.0 && !activePlayer.currentPropId) {
          this.footstepTimer = 0;
          soundManager.playFootstep();
        }

        // Smooth heading rotation
        if (isMovingInput) {
          const targetHeading = Math.atan2(moveDir.x, moveDir.z);
          let diff = targetHeading - activePlayer.rotation;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          activePlayer.rotation += diff * Math.min(1.0, dt * 14);
        }

        // Update mesh position and rotation
        const mesh = activePlayer.currentPropId
          ? this.transformedPropMeshes.get(activePlayer.id)
          : this.playerMeshes.get(activePlayer.id);

        if (mesh) {
          mesh.position.set(clamped.x, 0, clamped.z);
          mesh.rotation.y = activePlayer.rotation;

          // Prop whimsical bounce/hop when moving as a disguised prop
          if (activePlayer.currentPropId) {
            this.propMoveTime += dt * 12;
            mesh.position.y = Math.abs(Math.sin(this.propMoveTime)) * 0.12;
            mesh.rotation.z = Math.sin(this.propMoveTime) * 0.08;

            const staticProp = this.mapData.interactableProps.find((p) => p.playerId === activePlayer.id);
            if (staticProp) {
              staticProp.bounds.setFromObject(mesh);
            }
          }
        }

        // Animate legs if in character form
        const controller = this.playerControllers.get(activePlayer.id);
        if (controller) {
          controller.updateAnimation(currentSpeed, dt);
        }
      }
    } else {
      // Idle animation & prop settling
      const controller = this.playerControllers.get(activePlayer.id);
      if (controller) {
        controller.updateAnimation(0, dt);
      }
      if (activePlayer.currentPropId) {
        const mesh = this.transformedPropMeshes.get(activePlayer.id);
        if (mesh) {
          mesh.position.y = 0;
          mesh.rotation.z = 0;
        }
      }
    }

    // Update preview mesh placement in front of hider
    if (this.previewMesh && activePlayer.role === 'HIDER') {
      const charPos = new THREE.Vector3(...activePlayer.position);
      const rot = activePlayer.rotation;
      const previewPos = charPos.clone().add(new THREE.Vector3(Math.sin(rot) * 1.2, 0, Math.cos(rot) * 1.2));
      this.previewMesh.position.copy(previewPos);
      this.previewMesh.rotation.y = rot;
    }
  }

  private updateBots(dt: number) {
    if (!this.mapData) return;
    const mapData = this.mapData;
    const isPrep = this.phase === 'PREPARATION';

    this.players.forEach((p) => {
      if (!p.isBot || p.id === this.activePlayerId) return;

      if (p.role === 'HIDER') {
        this.botController.updateHiderBot(
          p,
          dt,
          isPrep,
          (botId, propId) => this.transformPlayer(botId, propId),
          (botId, delta, rot) => {
            const pos = new THREE.Vector3(...p.position).add(delta);
            const clamped = CollisionSystem.clampToMap(pos, 0.4, mapData.mapSize);
            p.position = [clamped.x, 0, clamped.z];
            p.rotation = rot;
            const mesh = p.currentPropId ? this.transformedPropMeshes.get(botId) : this.playerMeshes.get(botId);
            if (mesh) {
              mesh.position.set(clamped.x, 0, clamped.z);
              mesh.rotation.y = rot;
              if (p.currentPropId) {
                const sp = mapData.interactableProps.find((item) => item.playerId === botId);
                if (sp) sp.bounds.setFromObject(mesh);
              }
            }
            const ctrl = this.playerControllers.get(botId);
            if (ctrl) ctrl.updateAnimation(2.5, dt);
          },
          mapData.mapSize
        );
      } else if (p.role === 'SEEKER' && this.phase === 'SEEKING') {
        const propTargets = mapData.interactableProps.map((p) => p.mesh.position);
        this.botController.updateSeekerBot(
          p,
          dt,
          (botId, delta, rot) => {
            const pos = new THREE.Vector3(...p.position).add(delta);
            const clamped = CollisionSystem.clampToMap(pos, 0.4, mapData.mapSize);
            p.position = [clamped.x, 0, clamped.z];
            p.rotation = rot;
            const mesh = this.playerMeshes.get(botId);
            if (mesh) {
              mesh.position.set(clamped.x, 0, clamped.z);
              mesh.rotation.y = rot;
            }
            const ctrl = this.playerControllers.get(botId);
            if (ctrl) ctrl.updateAnimation(3.5, dt);
          },
          () => {
            // Bot inspects nearby
            this.inspectTargetProp();
          },
          mapData.mapSize,
          propTargets
        );
      }
    });
  }

  private updateCamera(dt: number) {
    const activePlayer = this.getActivePlayer();
    if (!activePlayer) return;

    // Smoothly follow player
    const playerPos = new THREE.Vector3(...activePlayer.position);
    this.cameraTarget.lerp(new THREE.Vector3(playerPos.x, playerPos.y + 1.1, playerPos.z), dt * 10);

    // Calculate spherical camera position
    const cosPitch = Math.cos(this.cameraAngle.pitch);
    const sinPitch = Math.sin(this.cameraAngle.pitch);
    const cosYaw = Math.cos(this.cameraAngle.yaw);
    const sinYaw = Math.sin(this.cameraAngle.yaw);

    const offset = new THREE.Vector3(sinYaw * cosPitch, sinPitch, cosYaw * cosPitch).multiplyScalar(
      this.cameraDistance
    );

    const desiredCamPos = this.cameraTarget.clone().add(offset);
    this.camera.position.copy(desiredCamPos);
    this.camera.lookAt(this.cameraTarget);
  }

  private updateRaycast() {
    const activePlayer = this.getActivePlayer();
    if (!activePlayer || !this.mapData) return;

    if (activePlayer.role === 'SEEKER') {
      if (this.phase === 'PREPARATION') {
        this.targetedProp = null;
        this.callbacks.onTargetPropChanged(null, false);
        return;
      }

      const playerPos = new THREE.Vector3(...activePlayer.position);
      // Proximity detection: Walk up in front of an object to prompt inspection!
      const target = CollisionSystem.findPropInFrontOfPlayer(
        playerPos,
        activePlayer.rotation,
        this.mapData.interactableProps,
        this.mapData.staticColliders,
        3.8
      );

      this.targetedProp = target;
      this.callbacks.onTargetPropChanged(target, false);
    } else {
      // Hider preview check
      this.targetedProp = null;
      this.callbacks.onTargetPropChanged(null, true);
    }
  }

  // --- Visual Effects (Particles & Sound Waves) ---

  private createPuffParticles(pos: THREE.Vector3) {
    const pCount = 18;
    const geom = new THREE.SphereGeometry(0.08, 6, 6);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    const pGroup = new THREE.Group();

    for (let i = 0; i < pCount; i++) {
      const p = new THREE.Mesh(geom, mat);
      const angle = (i / pCount) * Math.PI * 2;
      p.position.set(pos.x + Math.cos(angle) * 0.3, pos.y + 0.5 + Math.random() * 0.4, pos.z + Math.sin(angle) * 0.3);
      pGroup.add(p);
    }
    this.scene.add(pGroup);

    let life = 0;
    const interval = setInterval(() => {
      life += 0.05;
      pGroup.children.forEach((c, idx) => {
        const angle = (idx / pCount) * Math.PI * 2;
        c.position.x += Math.cos(angle) * 0.05;
        c.position.z += Math.sin(angle) * 0.05;
        c.position.y += 0.03;
        c.scale.multiplyScalar(0.92);
      });
      if (life > 0.4) {
        clearInterval(interval);
        this.scene.remove(pGroup);
      }
    }, 30);
  }

  private createSoundWaveEffect(pos: THREE.Vector3) {
    const ringGeom = new THREE.RingGeometry(0.3, 0.45, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x55ffaa, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(pos.x, 0.1, pos.z);
    this.scene.add(ring);

    let scale = 1.0;
    const interval = setInterval(() => {
      scale += 0.4;
      ring.scale.set(scale, scale, 1);
      ringMat.opacity *= 0.82;
      if (ringMat.opacity < 0.05) {
        clearInterval(interval);
        this.scene.remove(ring);
      }
    }, 40);
  }

  // --- Input & Event Listeners ---

  private setupEventListeners() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    const canvas = this.renderer.domElement;
    canvas.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    canvas.addEventListener('wheel', this.handleWheel, { passive: true });
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    this.keysPressed.add(e.code);

    const active = this.getActivePlayer();
    if (!active) return;

    // During PREPARATION phase, Seeker is immobilized and cannot take actions
    if (this.phase === 'PREPARATION' && active.role === 'SEEKER') {
      return;
    }

    if (e.code === 'KeyE') {
      if (active.role === 'SEEKER') {
        this.inspectTargetProp();
      } else if (active.role === 'HIDER') {
        // Transform into currently selected prop from carousel!
        const selected = this.getSelectedProp();
        this.transformPlayer(active.id, selected.id);
      }
    } else if (e.code === 'KeyQ') {
      this.changeSelectedProp(-1);
    } else if (e.code === 'KeyR') {
      if (active.role === 'HIDER') {
        if (active.currentPropId) {
          this.revertPlayerForm(active.id);
        }
      }
    } else if (e.code === 'KeyT') {
      this.triggerTaunt();
    } else if (e.code === 'Space') {
      if (active.role === 'SEEKER') {
        this.inspectTargetProp();
      }
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keysPressed.delete(e.code);
  };

  private handleMouseDown = (e: MouseEvent) => {
    const active = this.getActivePlayer();
    // In preparation phase, seeker cannot interact or look
    if (this.phase === 'PREPARATION' && active && active.role === 'SEEKER') {
      return;
    }

    if (e.button === 0) {
      // Left click
      if (active && active.role === 'SEEKER') {
        this.inspectTargetProp();
      }
    }
    this.isMouseDown = true;
    this.mousePrevPos = { x: e.clientX, y: e.clientY };
  };

  private handleMouseUp = () => {
    this.isMouseDown = false;
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.isMouseDown) return;
    const active = this.getActivePlayer();
    // In preparation phase, seeker cannot rotate camera or look around ("see here and there")
    if (this.phase === 'PREPARATION' && active && active.role === 'SEEKER') {
      return;
    }

    const dx = e.clientX - this.mousePrevPos.x;
    const dy = e.clientY - this.mousePrevPos.y;
    this.mousePrevPos = { x: e.clientX, y: e.clientY };

    this.cameraAngle.yaw -= dx * 0.006;
    this.cameraAngle.pitch = Math.max(0.1, Math.min(1.2, this.cameraAngle.pitch + dy * 0.005));
  };

  private handleWheel = (e: WheelEvent) => {
    this.cameraDistance = Math.max(3.0, Math.min(9.0, this.cameraDistance + e.deltaY * 0.005));
  };

  private setupResizeObserver() {
    const ro = new ResizeObserver(() => {
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      if (w === 0 || h === 0) return;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
    ro.observe(this.container);
  }

  // --- Getters & Setters ---

  public getActivePlayer(): PlayerData | undefined {
    return this.players.find((p) => p.id === this.activePlayerId);
  }

  public setActivePlayerId(id: string) {
    this.activePlayerId = id;
    this.updatePreviewMesh();
  }

  public getPlayers(): PlayerData[] {
    return this.players;
  }

  public destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('mousemove', this.handleMouseMove);

    soundManager.stopAmbientMusic();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
