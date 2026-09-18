import * as THREE from 'three';
import { PlayerData, PropDefinition } from '../../types';
import { PROP_DEFINITIONS } from '../models/PropLibrary';

export class BotController {
  // Simple navigation waypoints or target destinations
  private targetPositions: Map<string, THREE.Vector3> = new Map();
  private waitTimers: Map<string, number> = new Map();

  public updateHiderBot(
    player: PlayerData,
    dt: number,
    isPrep: boolean,
    onTransform: (playerId: string, propId: string) => void,
    onMove: (playerId: string, deltaPos: THREE.Vector3, rot: number) => void,
    mapBounds: { minX: number; maxX: number; minZ: number; maxZ: number }
  ) {
    if (player.state === 'DISCOVERED' || player.state === 'ELIMINATED') return;

    // During prep phase: wander to a hiding spot, then transform into an object
    if (isPrep && player.state !== 'TRANSFORMED' && player.state !== 'HIDDEN') {
      let target = this.targetPositions.get(player.id);
      if (!target) {
        // Pick a spot near edges or corners
        const x = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * (mapBounds.maxX - 2) + 1);
        const z = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * (mapBounds.maxZ - 2) + 1);
        target = new THREE.Vector3(x, 0, z);
        this.targetPositions.set(player.id, target);
      }

      const current = new THREE.Vector3(...player.position);
      const toTarget = target.clone().sub(current);
      toTarget.y = 0;

      if (toTarget.length() > 0.5) {
        const moveDir = toTarget.clone().normalize();
        const rot = Math.atan2(moveDir.x, moveDir.z);
        const delta = moveDir.multiplyScalar(3.0 * dt);
        onMove(player.id, delta, rot);
      } else {
        // Reached hiding spot! Transform into random prop
        const randomProp: PropDefinition = PROP_DEFINITIONS[Math.floor(Math.random() * PROP_DEFINITIONS.length)];
        onTransform(player.id, randomProp.id);
        this.targetPositions.delete(player.id);
      }
    }
  }

  public updateSeekerBot(
    player: PlayerData,
    dt: number,
    onMove: (playerId: string, deltaPos: THREE.Vector3, rot: number) => void,
    onInspect: () => void,
    mapBounds: { minX: number; maxX: number; minZ: number; maxZ: number },
    targetPropPositions: THREE.Vector3[]
  ) {
    if (player.role !== 'SEEKER') return;

    let wait = this.waitTimers.get(player.id) || 0;
    if (wait > 0) {
      this.waitTimers.set(player.id, wait - dt);
      return;
    }

    let target = this.targetPositions.get(player.id);
    if (!target) {
      // Pick a prop to go inspect, or a patrol point
      if (targetPropPositions.length > 0 && Math.random() < 0.65) {
        const randProp = targetPropPositions[Math.floor(Math.random() * targetPropPositions.length)];
        target = randProp.clone().add(new THREE.Vector3((Math.random() - 0.5) * 1.5, 0, (Math.random() - 0.5) * 1.5));
      } else {
        const x = (Math.random() - 0.5) * (mapBounds.maxX - mapBounds.minX) * 0.7;
        const z = (Math.random() - 0.5) * (mapBounds.maxZ - mapBounds.minZ) * 0.7;
        target = new THREE.Vector3(x, 0, z);
      }
      this.targetPositions.set(player.id, target);
    }

    const current = new THREE.Vector3(...player.position);
    const toTarget = target.clone().sub(current);
    toTarget.y = 0;

    if (toTarget.length() > 0.8) {
      const moveDir = toTarget.clone().normalize();
      const rot = Math.atan2(moveDir.x, moveDir.z);
      const delta = moveDir.multiplyScalar(3.6 * dt);
      onMove(player.id, delta, rot);
    } else {
      // Arrived at target: Inspect!
      onInspect();
      this.waitTimers.set(player.id, 1.2 + Math.random() * 1.5);
      this.targetPositions.delete(player.id);
    }
  }

  public reset() {
    this.targetPositions.clear();
    this.waitTimers.clear();
  }
}
