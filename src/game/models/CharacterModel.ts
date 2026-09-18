import * as THREE from 'three';

export interface CharacterMeshOptions {
  color: string;
  isSeeker: boolean;
  name: string;
}

export class CharacterControllerMesh {
  public group: THREE.Group;
  public leftLeg: THREE.Mesh;
  public rightLeg: THREE.Mesh;
  public leftArm: THREE.Mesh;
  public rightArm: THREE.Mesh;
  public head: THREE.Group;
  public roleIndicator: THREE.Sprite | null = null;
  private animTime: number = 0;

  constructor(options: CharacterMeshOptions) {
    this.group = new THREE.Group();
    const colorHex = parseInt(options.color.replace('#', '0x'), 16);

    // --- Materials ---
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf3be96, roughness: 0.6 });
    const clothesMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.5 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x223344, roughness: 0.7 });
    const shoesMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.4 });
    const capMat = new THREE.MeshStandardMaterial({
      color: options.isSeeker ? 0xcc2222 : colorHex,
      roughness: 0.5,
    });

    // --- Torso / Hoodie ---
    const torsoGeom = new THREE.BoxGeometry(0.5, 0.6, 0.32);
    const torso = new THREE.Mesh(torsoGeom, clothesMat);
    torso.position.y = 0.85;
    torso.castShadow = true;
    this.group.add(torso);

    // Backpack
    const packMat = new THREE.MeshStandardMaterial({ color: 0x1b2838, roughness: 0.8 });
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.44, 0.16), packMat);
    pack.position.set(0, 0.85, -0.22);
    pack.castShadow = true;
    this.group.add(pack);

    // --- Head Group ---
    this.head = new THREE.Group();
    this.head.position.set(0, 1.35, 0);

    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 14), skinMat);
    headMesh.castShadow = true;
    this.head.add(headMesh);

    // Cap
    const capDome = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), capMat);
    capDome.position.y = 0.08;
    const capVisor = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.03, 0.22), capMat);
    capVisor.position.set(0, 0.09, 0.22);
    capVisor.rotation.x = 0.12;
    this.head.add(capDome, capVisor);

    // Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), eyeMat);
    eyeL.position.set(-0.08, 0.02, 0.22);
    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), eyeMat);
    eyeR.position.set(0.08, 0.02, 0.22);
    this.head.add(eyeL, eyeR);

    // Smile
    const smileGeom = new THREE.TorusGeometry(0.06, 0.012, 6, 8, Math.PI);
    const smile = new THREE.Mesh(smileGeom, eyeMat);
    smile.rotation.x = Math.PI;
    smile.position.set(0, -0.09, 0.22);
    this.head.add(smile);

    this.group.add(this.head);

    // --- Legs ---
    const legGeom = new THREE.BoxGeometry(0.16, 0.48, 0.18);
    legGeom.translate(0, -0.24, 0); // Pivot at hip

    this.leftLeg = new THREE.Mesh(legGeom, pantsMat);
    this.leftLeg.position.set(-0.14, 0.55, 0);
    this.leftLeg.castShadow = true;

    this.rightLeg = new THREE.Mesh(legGeom, pantsMat);
    this.rightLeg.position.set(0.14, 0.55, 0);
    this.rightLeg.castShadow = true;

    // Shoes
    const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.26), shoesMat);
    shoeL.position.set(0, -0.44, 0.04);
    this.leftLeg.add(shoeL);

    const shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.26), shoesMat);
    shoeR.position.set(0, -0.44, 0.04);
    this.rightLeg.add(shoeR);

    this.group.add(this.leftLeg, this.rightLeg);

    // --- Arms ---
    const armGeom = new THREE.BoxGeometry(0.14, 0.44, 0.14);
    armGeom.translate(0, -0.22, 0); // Pivot at shoulder

    this.leftArm = new THREE.Mesh(armGeom, clothesMat);
    this.leftArm.position.set(-0.33, 1.1, 0);
    this.leftArm.castShadow = true;

    this.rightArm = new THREE.Mesh(armGeom, clothesMat);
    this.rightArm.position.set(0.33, 1.1, 0);
    this.rightArm.castShadow = true;

    // Hands
    const handL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), skinMat);
    handL.position.set(0, -0.42, 0);
    this.leftArm.add(handL);

    const handR = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), skinMat);
    handR.position.set(0, -0.42, 0);
    this.rightArm.add(handR);

    this.group.add(this.leftArm, this.rightArm);

    // Overhead indicator sprite (red arrow + Seeker/Hider tag)
    this.createRoleIndicator(options.isSeeker, options.name, options.color);
  }

  private createRoleIndicator(isSeeker: boolean, name: string, color: string) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // Text
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (isSeeker) {
      // Red glow text "Seeker"
      ctx.fillStyle = '#ff3333';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 8;
      ctx.fillText('Seeker', 128, 40);

      // Red downward pointing triangle
      ctx.fillStyle = '#ff2222';
      ctx.beginPath();
      ctx.moveTo(128, 90);
      ctx.lineTo(110, 65);
      ctx.lineTo(146, 65);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = color;
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 8;
      ctx.fillText(name, 128, 50);
    }

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    this.roleIndicator = new THREE.Sprite(spriteMat);
    this.roleIndicator.scale.set(1.4, 0.7, 1);
    this.roleIndicator.position.set(0, 2.0, 0);
    this.group.add(this.roleIndicator);
  }

  public updateAnimation(speed: number, dt: number) {
    if (speed > 0.05) {
      this.animTime += dt * speed * 12;
      const legAngle = Math.sin(this.animTime) * 0.6;
      this.leftLeg.rotation.x = legAngle;
      this.rightLeg.rotation.x = -legAngle;

      // Natural arm swing
      this.leftArm.rotation.x = -legAngle * 0.7;
      this.rightArm.rotation.x = legAngle * 0.7;
      this.head.position.y = 1.35 + Math.abs(Math.sin(this.animTime * 2)) * 0.04;
    } else {
      // Idle breathing
      this.animTime += dt * 2;
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
      this.head.position.y = 1.35 + Math.sin(this.animTime) * 0.015;
      this.leftArm.rotation.x = Math.sin(this.animTime) * 0.05;
      this.rightArm.rotation.x = -Math.sin(this.animTime) * 0.05;
    }
  }

  public setIndicatorVisible(visible: boolean) {
    if (this.roleIndicator) {
      this.roleIndicator.visible = visible;
    }
  }
}
