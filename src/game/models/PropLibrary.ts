import * as THREE from 'three';
import { PropDefinition } from '../../types';

export const PROP_DEFINITIONS: PropDefinition[] = [
  {
    id: 'box',
    name: 'Cardboard Box',
    category: 'medium',
    speedMultiplier: 0.85,
    width: 0.9,
    height: 0.8,
    depth: 0.9,
    description: 'A cozy delivery box with tape and folded flaps. Great for blending anywhere.',
    iconName: 'Package',
  },
  {
    id: 'plant',
    name: 'Potted Plant',
    category: 'medium',
    speedMultiplier: 0.8,
    width: 0.7,
    height: 1.0,
    depth: 0.7,
    description: 'Ceramic terracotta pot with lush broad leaves. Fits tables, corners, and gardens.',
    iconName: 'Flower2',
  },
  {
    id: 'chair',
    name: 'Wooden Chair',
    category: 'medium',
    speedMultiplier: 0.75,
    width: 0.7,
    height: 1.2,
    depth: 0.7,
    description: 'Classic handcrafted wooden dining chair with back slats.',
    iconName: 'Armchair',
  },
  {
    id: 'basket',
    name: 'Laundry Basket',
    category: 'medium',
    speedMultiplier: 0.8,
    width: 0.9,
    height: 0.75,
    depth: 0.75,
    description: 'Plastic mesh laundry basket overflowing with cozy folded towels.',
    iconName: 'ShoppingBag',
  },
  {
    id: 'books',
    name: 'Book Stack',
    category: 'small',
    speedMultiplier: 0.95,
    width: 0.55,
    height: 0.4,
    depth: 0.45,
    description: 'A neat stack of hardcover books with bookmark ribbons.',
    iconName: 'BookOpen',
  },
  {
    id: 'bottle',
    name: 'Glass Bottle',
    category: 'small',
    speedMultiplier: 1.0,
    width: 0.35,
    height: 0.65,
    depth: 0.35,
    description: 'Soda bottle with cap and label. Compact and fast!',
    iconName: 'Wine',
  },
  {
    id: 'lamp',
    name: 'Cozy Lamp',
    category: 'medium',
    speedMultiplier: 0.75,
    width: 0.6,
    height: 1.3,
    depth: 0.6,
    description: 'Warm glowing room lamp with brushed brass base and fabric shade.',
    iconName: 'Lamp',
  },
  {
    id: 'bear',
    name: 'Teddy Bear',
    category: 'small',
    speedMultiplier: 0.9,
    width: 0.6,
    height: 0.75,
    depth: 0.55,
    description: 'Soft cuddly teddy bear with a red bow tie. Looks innocent and cute.',
    iconName: 'Smile',
  },
  {
    id: 'watering_can',
    name: 'Watering Can',
    category: 'small',
    speedMultiplier: 0.9,
    width: 0.6,
    height: 0.6,
    depth: 0.4,
    description: 'Vintage metal gardening watering can with long angled spout.',
    iconName: 'Droplets',
  },
];

// Helper to generate procedural canvas texture for box (with cute cat face like reference image!)
function createCardboardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Cardboard base
  ctx.fillStyle = '#b7834a';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle noise fibers
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)';
    ctx.fillRect(x, y, 2, 2);
  }

  // Tape strip across top
  ctx.fillStyle = '#9e6d38';
  ctx.fillRect(0, 240, 512, 32);

  // Cute printed cat face outline (from image 2!)
  ctx.strokeStyle = '#5a3d1c';
  ctx.lineWidth = 6;
  ctx.beginPath();
  // Cat head circle
  ctx.arc(256, 360, 48, 0, Math.PI * 2);
  ctx.stroke();

  // Cat ears
  ctx.fillStyle = '#5a3d1c';
  ctx.beginPath();
  ctx.moveTo(220, 325);
  ctx.lineTo(205, 280);
  ctx.lineTo(238, 315);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(274, 315);
  ctx.lineTo(307, 280);
  ctx.lineTo(292, 325);
  ctx.fill();

  // Cat eyes
  ctx.beginPath();
  ctx.arc(240, 355, 6, 0, Math.PI * 2);
  ctx.arc(272, 355, 6, 0, Math.PI * 2);
  ctx.fill();

  // Cat nose & mouth
  ctx.beginPath();
  ctx.arc(256, 370, 3, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Cached textures
let cachedCardboardTex: THREE.CanvasTexture | null = null;
function getCardboardTexture() {
  if (!cachedCardboardTex) {
    cachedCardboardTex = createCardboardTexture();
  }
  return cachedCardboardTex;
}

export function createPropMesh(propId: string): THREE.Group {
  const group = new THREE.Group();
  group.name = `prop_${propId}`;

  switch (propId) {
    case 'box': {
      const tex = getCardboardTexture();
      const mat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.85,
        metalness: 0.05,
      });

      const boxGeom = new THREE.BoxGeometry(0.85, 0.75, 0.85);
      const box = new THREE.Mesh(boxGeom, mat);
      box.position.y = 0.75 / 2;
      box.castShadow = true;
      box.receiveShadow = true;
      group.add(box);

      // Flap edges
      const flapGeom = new THREE.BoxGeometry(0.88, 0.04, 0.44);
      const flapMat = new THREE.MeshStandardMaterial({ color: 0x9b6a38, roughness: 0.9 });
      const flap1 = new THREE.Mesh(flapGeom, flapMat);
      flap1.position.set(0, 0.76, 0.22);
      flap1.rotation.x = -0.05;
      group.add(flap1);
      break;
    }

    case 'plant': {
      // Terracotta pot
      const potGeom = new THREE.CylinderGeometry(0.35, 0.25, 0.5, 16);
      const potMat = new THREE.MeshStandardMaterial({ color: 0xb55a30, roughness: 0.7 });
      const pot = new THREE.Mesh(potGeom, potMat);
      pot.position.y = 0.25;
      pot.castShadow = true;
      pot.receiveShadow = true;
      group.add(pot);

      // Pot rim
      const rimGeom = new THREE.TorusGeometry(0.35, 0.04, 8, 16);
      const rim = new THREE.Mesh(rimGeom, potMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 0.48;
      group.add(rim);

      // Soil
      const soilGeom = new THREE.CylinderGeometry(0.33, 0.33, 0.05, 16);
      const soilMat = new THREE.MeshStandardMaterial({ color: 0x2b1d0c, roughness: 0.95 });
      const soil = new THREE.Mesh(soilGeom, soilMat);
      soil.position.y = 0.47;
      group.add(soil);

      // Leaves (layered stylized foliage)
      const leafMat = new THREE.MeshStandardMaterial({
        color: 0x2e8b3e,
        roughness: 0.5,
        side: THREE.DoubleSide,
      });

      for (let i = 0; i < 9; i++) {
        const angle = (i / 9) * Math.PI * 2;
        const leafGeom = new THREE.ConeGeometry(0.18, 0.55, 5);
        leafGeom.scale(1, 1, 0.2);
        const leaf = new THREE.Mesh(leafGeom, leafMat);
        leaf.position.set(Math.cos(angle) * 0.12, 0.65, Math.sin(angle) * 0.12);
        leaf.rotation.set(0.4 * Math.cos(angle), -angle, 0.4 * Math.sin(angle));
        leaf.castShadow = true;
        group.add(leaf);
      }

      // Center taller leaf
      const centerLeaf = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.65, 5), leafMat);
      centerLeaf.scale.set(1, 1, 0.25);
      centerLeaf.position.y = 0.75;
      centerLeaf.castShadow = true;
      group.add(centerLeaf);
      break;
    }

    case 'chair': {
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.6 });

      // Seat
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.06, 0.65), woodMat);
      seat.position.y = 0.5;
      seat.castShadow = true;
      group.add(seat);

      // 4 Legs
      const legGeom = new THREE.CylinderGeometry(0.03, 0.025, 0.5, 8);
      const legPositions = [
        [-0.26, 0.25, -0.26],
        [0.26, 0.25, -0.26],
        [-0.26, 0.25, 0.26],
        [0.26, 0.25, 0.26],
      ];
      legPositions.forEach(([x, y, z]) => {
        const leg = new THREE.Mesh(legGeom, woodMat);
        leg.position.set(x, y, z);
        leg.castShadow = true;
        group.add(leg);
      });

      // Backrest posts
      const postGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8);
      const post1 = new THREE.Mesh(postGeom, woodMat);
      post1.position.set(-0.26, 0.8, -0.26);
      const post2 = new THREE.Mesh(postGeom, woodMat);
      post2.position.set(0.26, 0.8, -0.26);
      group.add(post1, post2);

      // Back slats
      for (let s = 0; s < 3; s++) {
        const slat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.03), woodMat);
        slat.position.set(0, 0.68 + s * 0.16, -0.26);
        slat.castShadow = true;
        group.add(slat);
      }
      break;
    }

    case 'basket': {
      // White/cream laundry basket with open top & towel
      const basketMat = new THREE.MeshStandardMaterial({ color: 0xededed, roughness: 0.6 });
      const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.35, 0.55, 16, 1, true), basketMat);
      basket.position.y = 0.55 / 2;
      basket.castShadow = true;
      group.add(basket);

      // Basket bottom
      const bot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.02, 16), basketMat);
      bot.position.y = 0.01;
      group.add(bot);

      // Basket rim
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.03, 8, 16), basketMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 0.55;
      group.add(rim);

      // Laundry towel pile overflowing
      const clothMat = new THREE.MeshStandardMaterial({ color: 0x3d70b2, roughness: 0.9 });
      const cloth = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 10), clothMat);
      cloth.scale.set(1, 0.6, 1);
      cloth.position.y = 0.45;
      cloth.castShadow = true;
      group.add(cloth);

      // Folded cloth hanging on rim
      const hang = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 0.04), new THREE.MeshStandardMaterial({ color: 0xd9ba80 }));
      hang.position.set(0, 0.42, 0.4);
      hang.rotation.x = 0.2;
      group.add(hang);
      break;
    }

    case 'books': {
      const colors = [0xb22222, 0x1f4b8e, 0x2e6f40, 0xd4a017];
      colors.forEach((c, idx) => {
        const bookMat = new THREE.MeshStandardMaterial({ color: c, roughness: 0.5 });
        const pagesMat = new THREE.MeshStandardMaterial({ color: 0xfbf7ed, roughness: 0.9 });

        const book = new THREE.Group();
        const cover = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.08, 0.32), bookMat);
        const pages = new THREE.Mesh(new THREE.BoxGeometry(0.43, 0.06, 0.3), pagesMat);
        pages.position.x = 0.01;
        book.add(cover, pages);

        book.position.y = 0.04 + idx * 0.085;
        book.rotation.y = (idx * 0.18) - 0.25;
        book.castShadow = true;
        group.add(book);
      });
      break;
    }

    case 'bottle': {
      const bottleMat = new THREE.MeshPhysicalMaterial({
        color: 0x2f6048,
        roughness: 0.1,
        transmission: 0.7,
        thickness: 0.2,
        transparent: true,
        opacity: 0.85,
      });

      // Body
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.35, 16), bottleMat);
      body.position.y = 0.35 / 2;
      body.castShadow = true;
      group.add(body);

      // Shoulder
      const shoulder = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.1, 16), bottleMat);
      shoulder.position.y = 0.35 + 0.05;
      group.add(shoulder);

      // Neck
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.15, 12), bottleMat);
      neck.position.y = 0.45 + 0.075;
      group.add(neck);

      // Cap
      const capMat = new THREE.MeshStandardMaterial({ color: 0xc49c3b, metalness: 0.8, roughness: 0.3 });
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 12), capMat);
      cap.position.y = 0.62;
      group.add(cap);

      // Label
      const labelMat = new THREE.MeshStandardMaterial({ color: 0xfffcf0, roughness: 0.8 });
      const label = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.125, 0.16, 16, 1, true), labelMat);
      label.position.y = 0.2;
      group.add(label);
      break;
    }

    case 'lamp': {
      const brassMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.7, roughness: 0.3 });
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.04, 16), brassMat);
      base.position.y = 0.02;
      base.castShadow = true;
      group.add(base);

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8), brassMat);
      pole.position.y = 0.42;
      group.add(pole);

      // Shade
      const shadeMat = new THREE.MeshStandardMaterial({
        color: 0xfffae6,
        roughness: 0.7,
        emissive: 0xffe6aa,
        emissiveIntensity: 0.4,
      });
      const shade = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.35, 16, 1, true), shadeMat);
      shade.position.y = 0.88;
      shade.castShadow = true;
      group.add(shade);
      break;
    }

    case 'bear': {
      const furMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.85 });

      // Body
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), furMat);
      body.scale.set(1, 1.2, 0.9);
      body.position.y = 0.28;
      body.castShadow = true;
      group.add(body);

      // Head
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), furMat);
      head.position.y = 0.58;
      head.castShadow = true;
      group.add(head);

      // Snout
      const snoutMat = new THREE.MeshStandardMaterial({ color: 0xd2b48c, roughness: 0.9 });
      const snout = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), snoutMat);
      snout.scale.set(1.1, 0.8, 1.2);
      snout.position.set(0, 0.56, 0.16);
      group.add(snout);

      // Button nose & eyes
      const blackMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2 });
      const nose = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), blackMat);
      nose.position.set(0, 0.6, 0.24);
      group.add(nose);

      const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), blackMat);
      eyeL.position.set(-0.07, 0.62, 0.16);
      const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), blackMat);
      eyeR.position.set(0.07, 0.62, 0.16);
      group.add(eyeL, eyeR);

      // Ears
      const earL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), furMat);
      earL.position.set(-0.16, 0.72, 0);
      const earR = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), furMat);
      earR.position.set(0.16, 0.72, 0);
      group.add(earL, earR);

      // Red bow tie
      const bowMat = new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.5 });
      const bow = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.05), bowMat);
      bow.position.set(0, 0.44, 0.16);
      group.add(bow);
      break;
    }

    case 'watering_can': {
      const metalMat = new THREE.MeshStandardMaterial({ color: 0x2e6b52, roughness: 0.4, metalness: 0.3 });

      // Body cylinder
      const can = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.35, 16), metalMat);
      can.position.y = 0.35 / 2;
      can.castShadow = true;
      group.add(can);

      // Spout
      const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.4, 8), metalMat);
      spout.rotation.z = -Math.PI / 4;
      spout.position.set(0.25, 0.28, 0);
      group.add(spout);

      // Rose head
      const rose = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.05, 12), metalMat);
      rose.rotation.z = -Math.PI / 4;
      rose.position.set(0.4, 0.42, 0);
      group.add(rose);

      // Handle
      const handleGeom = new THREE.TorusGeometry(0.16, 0.02, 8, 12, Math.PI);
      const handle = new THREE.Mesh(handleGeom, metalMat);
      handle.rotation.z = Math.PI / 2;
      handle.position.set(-0.18, 0.22, 0);
      group.add(handle);
      break;
    }

    default: {
      const fallback = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.6, 0.6),
        new THREE.MeshStandardMaterial({ color: 0x888888 })
      );
      fallback.position.y = 0.3;
      group.add(fallback);
    }
  }

  return group;
}

// Create a semi-transparent preview holographic outline mesh
export function createPreviewMesh(propId: string): THREE.Group {
  const mesh = createPropMesh(propId);
  mesh.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material = new THREE.MeshBasicMaterial({
        color: 0x55ff77,
        transparent: true,
        opacity: 0.6,
        wireframe: true,
      });
    }
  });
  return mesh;
}
