import * as THREE from 'three';
import { StaticProp } from '../map/MapBuilder';

export class CollisionSystem {
  public static checkCollision(
    pos: THREE.Vector3,
    radius: number,
    staticColliders: THREE.Box3[],
    ignorePropBounds?: THREE.Box3
  ): boolean {
    const playerBox = new THREE.Box3(
      new THREE.Vector3(pos.x - radius, pos.y + 0.1, pos.z - radius),
      new THREE.Vector3(pos.x + radius, pos.y + 1.6, pos.z + radius)
    );

    for (const collider of staticColliders) {
      if (ignorePropBounds && collider === ignorePropBounds) continue;
      if (playerBox.intersectsBox(collider)) {
        return true;
      }
    }
    return false;
  }

  public static clampToMap(
    pos: THREE.Vector3,
    radius: number,
    bounds: { minX: number; maxX: number; minZ: number; maxZ: number }
  ): THREE.Vector3 {
    const clamped = pos.clone();
    clamped.x = Math.max(bounds.minX + radius + 0.2, Math.min(bounds.maxX - radius - 0.2, clamped.x));
    clamped.z = Math.max(bounds.minZ + radius + 0.2, Math.min(bounds.maxZ - radius - 0.2, clamped.z));
    return clamped;
  }

  /**
   * Detects the object in front of the Seeker using proximity and facing direction.
   * Works smoothly regardless of object height (floor bottles, table vases, books, shelf items, bears).
   */
  public static findPropInFrontOfPlayer(
    playerPos: THREE.Vector3,
    playerRotation: number,
    props: StaticProp[],
    wallColliders: THREE.Box3[],
    maxReach: number = 3.2
  ): StaticProp | null {
    const forward = new THREE.Vector3(Math.sin(playerRotation), 0, Math.cos(playerRotation)).normalize();
    const eyePos = new THREE.Vector3(playerPos.x, 1.1, playerPos.z);

    let bestProp: StaticProp | null = null;
    let bestScore = Infinity;

    for (const prop of props) {
      const propCenter = new THREE.Vector3();
      prop.bounds.getCenter(propCenter);

      const dx = propCenter.x - playerPos.x;
      const dz = propCenter.z - playerPos.z;
      const horizontalDist = Math.hypot(dx, dz);

      // Must be within max reach
      if (horizontalDist > maxReach) continue;

      // Vertical height check: must be within comfortable reach (ground to upper shelf)
      if (propCenter.y < -0.2 || propCenter.y > 3.6) continue;

      // Facing angle check
      const toProp = new THREE.Vector3(dx, 0, dz).normalize();
      const dot = forward.dot(toProp);

      // If very close (< 1.3m), wide cone accepted; otherwise within ~70° frontal cone
      const minDot = horizontalDist < 1.3 ? 0.05 : 0.32;
      if (dot < minDot) continue;

      // Score: lower is better. Heavily prefers closer and more directly aligned props
      const score = horizontalDist / (dot * 0.75 + 0.25);

      // Line of Sight check: ensure no tall wall blocks the view
      const toCenterRay = propCenter.clone().sub(eyePos);
      const rayLen = toCenterRay.length();
      if (rayLen > 0.01) {
        const ray = new THREE.Ray(eyePos, toCenterRay.normalize());
        let wallBlocked = false;
        for (const wall of wallColliders) {
          if (wall === prop.bounds) continue;
          const wallSize = new THREE.Vector3();
          wall.getSize(wallSize);
          if (wallSize.y < 2.5) continue; // Small obstacles do not block LOS

          const hit = new THREE.Vector3();
          if (ray.intersectBox(wall, hit)) {
            if (eyePos.distanceTo(hit) < rayLen - 0.25) {
              wallBlocked = true;
              break;
            }
          }
        }
        if (wallBlocked) continue;
      }

      if (score < bestScore) {
        bestScore = score;
        bestProp = prop;
      }
    }

    return bestProp;
  }

  /**
   * Raycast fallback for distant aiming.
   */
  public static raycastSeekerTarget(
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    maxDistance: number,
    props: StaticProp[],
    wallColliders: THREE.Box3[]
  ): StaticProp | null {
    const ray = new THREE.Ray(origin, direction.clone().normalize());

    let closestProp: StaticProp | null = null;
    let closestDist = maxDistance;

    // Check prop intersections with generous hit bounds (expanded by 0.15m for easy aiming)
    for (const prop of props) {
      const targetPoint = new THREE.Vector3();
      const expandedBounds = prop.bounds.clone().expandByScalar(0.18);
      const hit = ray.intersectBox(expandedBounds, targetPoint);
      if (hit) {
        const dist = origin.distanceTo(targetPoint);
        if (dist < closestDist) {
          closestDist = dist;
          closestProp = prop;
        }
      }
    }

    if (!closestProp) return null;

    // Line of sight check: verify no tall structural wall collider is between origin and the hit prop
    for (const wall of wallColliders) {
      if (wall === closestProp.bounds) continue;
      // Only consider large obstacles / walls (height > 2.5m) as true LOS blockers
      const wallSize = new THREE.Vector3();
      wall.getSize(wallSize);
      if (wallSize.y < 2.5) continue; // Small furniture/props don't block LOS to other objects

      const wallHit = new THREE.Vector3();
      if (ray.intersectBox(wall, wallHit)) {
        const wallDist = origin.distanceTo(wallHit);
        if (wallDist < closestDist - 0.2) {
          // A wall is blocking line of sight!
          return null;
        }
      }
    }

    return closestProp;
  }
}
