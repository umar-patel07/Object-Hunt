import * as THREE from 'three';
import { MapType } from '../../types';
import { createPropMesh } from '../models/PropLibrary';

export interface StaticProp {
  id: string;
  propType: string;
  mesh: THREE.Object3D;
  bounds: THREE.Box3;
  isPlayerProp: boolean;
  playerId?: string;
}

export interface MapData {
  group: THREE.Group;
  staticColliders: THREE.Box3[];
  interactableProps: StaticProp[];
  seekerSpawn: THREE.Vector3;
  hiderSpawns: THREE.Vector3[];
  mapSize: { minX: number; maxX: number; minZ: number; maxZ: number };
  lights: THREE.Light[];
  ambientColor: number;
}

export class MapBuilder {
  public static buildMap(type: MapType): MapData {
    switch (type) {
      case 'bedroom':
        return this.buildBedroomMap();
      case 'garden':
        return this.buildGardenMap();
      case 'supermarket':
        return this.buildSupermarketMap();
      default:
        return this.buildBedroomMap();
    }
  }

  // --- 1. COZY BEDROOM ---
  private static buildBedroomMap(): MapData {
    const group = new THREE.Group();
    const staticColliders: THREE.Box3[] = [];
    const interactableProps: StaticProp[] = [];
    const lights: THREE.Light[] = [];

    // Room boundaries - 1.5x enlarged to 39m x 33m
    const minX = -19.5, maxX = 19.5, minZ = -16.5, maxZ = 16.5, height = 5.2;

    // Floor: warm wood planks
    const floorGeom = new THREE.PlaneGeometry(39, 33);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xc4935a,
      roughness: 0.45,
      metalness: 0.08,
    });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    group.add(floor);

    // Wall Material (warm off-white / light cream with baseboard)
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xede4d3, roughness: 0.9 });

    const createWall = (w: number, h: number, d: number, x: number, y: number, z: number) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
      mesh.position.set(x, y, z);
      mesh.receiveShadow = true;
      group.add(mesh);
      staticColliders.push(new THREE.Box3().setFromObject(mesh));
    };

    // 4 Exterior Walls (39m x 33m)
    createWall(39.4, height, 0.4, 0, height / 2, minZ - 0.2); // North
    createWall(39.4, height, 0.4, 0, height / 2, maxZ + 0.2); // South
    createWall(0.4, height, 33.4, minX - 0.2, height / 2, 0); // West
    createWall(0.4, height, 33.4, maxX + 0.2, height / 2, 0); // East

    // Large center patterned blue rug
    const rugMat = new THREE.MeshStandardMaterial({ color: 0x2e5b88, roughness: 0.95 });
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(15.0, 11.5), rugMat);
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, 0.01, 0.5);
    rug.receiveShadow = true;
    group.add(rug);

    // Bedside rug
    const bedRug = new THREE.Mesh(new THREE.PlaneGeometry(7.0, 9.5), new THREE.MeshStandardMaterial({ color: 0x93674c, roughness: 0.9 }));
    bedRug.rotation.x = -Math.PI / 2;
    bedRug.position.set(-13.5, 0.012, -10.5);
    bedRug.receiveShadow = true;
    group.add(bedRug);

    // --- Master Bed with Plaid Blanket ---
    const bedGroup = new THREE.Group();
    const bedFrame = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 0.75, 3.8),
      new THREE.MeshStandardMaterial({ color: 0x5e3a20, roughness: 0.6 })
    );
    bedFrame.position.set(-14.0, 0.38, -11.0);
    bedFrame.castShadow = true;
    bedFrame.receiveShadow = true;
    bedGroup.add(bedFrame);

    // Headboard
    const headboard = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 2.2, 4.0),
      new THREE.MeshStandardMaterial({ color: 0x5e3a20, roughness: 0.6 })
    );
    headboard.position.set(-16.5, 1.1, -11.0);
    headboard.castShadow = true;
    bedGroup.add(headboard);

    // Mattress & Plaid Duvet
    const duvet = new THREE.Mesh(
      new THREE.BoxGeometry(4.7, 0.5, 3.5),
      new THREE.MeshStandardMaterial({ color: 0x2f6055, roughness: 0.8 })
    );
    duvet.position.set(-14.0, 0.88, -11.0);
    duvet.castShadow = true;
    bedGroup.add(duvet);

    // Pillows
    const pillowMat = new THREE.MeshStandardMaterial({ color: 0xf5eedc });
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.25, 0.85), pillowMat);
    p1.position.set(-15.6, 1.15, -11.9);
    const p2 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.25, 0.85), pillowMat);
    p2.position.set(-15.6, 1.15, -10.1);
    bedGroup.add(p1, p2);
    group.add(bedGroup);
    staticColliders.push(new THREE.Box3().setFromObject(bedGroup));

    // Bedside tables (Nightstands)
    const nightstandMat = new THREE.MeshStandardMaterial({ color: 0x6e472a, roughness: 0.5 });
    const ns1 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.85, 1.4), nightstandMat);
    ns1.position.set(-14.0, 0.42, -13.8);
    const ns2 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.85, 1.4), nightstandMat);
    ns2.position.set(-14.0, 0.42, -8.2);
    group.add(ns1, ns2);
    staticColliders.push(new THREE.Box3().setFromObject(ns1));
    staticColliders.push(new THREE.Box3().setFromObject(ns2));

    // --- Study & Gaming Corner (Northeast) ---
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x7c5335, roughness: 0.5 });
    const desk = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.14, 2.4), deskMat);
    desk.position.set(14.5, 1.3, -12.5);
    desk.castShadow = true;
    const deskLeg1 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.3, 2.3), new THREE.MeshStandardMaterial({ color: 0x2b2b2b }));
    deskLeg1.position.set(12.0, 0.65, -12.5);
    const deskLeg2 = deskLeg1.clone();
    deskLeg2.position.set(17.0, 0.65, -12.5);
    group.add(desk, deskLeg1, deskLeg2);
    staticColliders.push(new THREE.Box3().setFromObject(desk));

    // Dual Computer Monitors
    const monMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2 });
    const mon1 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.9, 0.08), monMat);
    mon1.position.set(13.6, 1.9, -13.0);
    const mon2 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.9, 0.08), monMat);
    mon2.position.set(15.4, 1.9, -12.9);
    mon2.rotation.y = -0.2;
    group.add(mon1, mon2);

    // --- Secondary Work Desk / Drafting Table ---
    const desk2 = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.12, 1.8), deskMat);
    desk2.position.set(15.0, 1.25, -4.0);
    desk2.castShadow = true;
    const legA = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.25, 1.7), new THREE.MeshStandardMaterial({ color: 0x2b2b2b }));
    legA.position.set(13.0, 0.62, -4.0);
    const legB = legA.clone();
    legB.position.set(17.0, 0.62, -4.0);
    group.add(desk2, legA, legB);
    staticColliders.push(new THREE.Box3().setFromObject(desk2));

    // --- Bookshelves Wall Unit (East Wall) ---
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.7 });
    const shelf1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4.0, 3.8), shelfMat);
    shelf1.position.set(18.0, 2.0, 5.0);
    shelf1.castShadow = true;
    const shelf2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4.0, 3.8), shelfMat);
    shelf2.position.set(18.0, 2.0, 10.5);
    shelf2.castShadow = true;
    group.add(shelf1, shelf2);
    staticColliders.push(new THREE.Box3().setFromObject(shelf1));
    staticColliders.push(new THREE.Box3().setFromObject(shelf2));

    // --- Large Wardrobes / Closets (Southwest Wall) ---
    const wardrobeMat = new THREE.MeshStandardMaterial({ color: 0x664834, roughness: 0.6 });
    const wardrobe = new THREE.Mesh(new THREE.BoxGeometry(4.4, 4.2, 1.6), wardrobeMat);
    wardrobe.position.set(-14.5, 2.1, 14.5);
    wardrobe.castShadow = true;
    const dresser = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.5, 1.4), wardrobeMat);
    dresser.position.set(-8.5, 0.75, 14.8);
    dresser.castShadow = true;
    group.add(wardrobe, dresser);
    staticColliders.push(new THREE.Box3().setFromObject(wardrobe));
    staticColliders.push(new THREE.Box3().setFromObject(dresser));

    // --- Center Lounge Area (Coffee Table & Armchairs) ---
    const coffeeTable = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 0.6, 2.4),
      new THREE.MeshStandardMaterial({ color: 0xa06d44, roughness: 0.4 })
    );
    coffeeTable.position.set(0, 0.3, 0.5);
    coffeeTable.castShadow = true;
    group.add(coffeeTable);
    staticColliders.push(new THREE.Box3().setFromObject(coffeeTable));

    // Cozy Plush Sofa
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0x3d5a80, roughness: 0.85 });
    const sofa = new THREE.Mesh(new THREE.BoxGeometry(6.0, 1.2, 2.0), sofaMat);
    sofa.position.set(0, 0.6, -4.0);
    sofa.castShadow = true;
    group.add(sofa);
    staticColliders.push(new THREE.Box3().setFromObject(sofa));

    // TV Stand & Television along North Wall Center
    const tvStand = new THREE.Mesh(
      new THREE.BoxGeometry(5.5, 0.75, 1.4),
      new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 })
    );
    tvStand.position.set(0, 0.38, -14.8);
    tvStand.castShadow = true;
    const tv = new THREE.Mesh(
      new THREE.BoxGeometry(4.6, 2.5, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.2 })
    );
    tv.position.set(0, 2.2, -14.8);
    group.add(tvStand, tv);
    staticColliders.push(new THREE.Box3().setFromObject(tvStand));

    // --- NATURAL PROPS (Spaced out, ~20% removed for clean, open feel) ---
    const spawnProp = (propType: string, x: number, y: number, z: number, rotY: number = 0) => {
      const pMesh = createPropMesh(propType);
      pMesh.position.set(x, y, z);
      pMesh.rotation.y = rotY;
      group.add(pMesh);

      const propData: StaticProp = {
        id: `static_${propType}_${Math.random().toString(36).substring(2, 7)}`,
        propType,
        mesh: pMesh,
        bounds: new THREE.Box3().setFromObject(pMesh),
        isPlayerProp: false,
      };
      interactableProps.push(propData);
      staticColliders.push(propData.bounds);
    };

    // Cardboard boxes (8 strategically placed, clean distribution)
    spawnProp('box', -4.0, 0, 6.0, 0.3);
    spawnProp('box', -4.8, 0, 6.8, -0.2);
    spawnProp('box', -4.4, 0.75, 6.4, 0.5); // Stacked
    spawnProp('box', 6.5, 0, 11.5, 0.4);
    spawnProp('box', 7.5, 0, 11.2, -0.3);
    spawnProp('box', -16.5, 0, 3.5, -0.4);
    spawnProp('box', 9.5, 0, -11.0, 0.1);
    spawnProp('box', -10.0, 0, -3.5, 0.2);

    // Potted plants (7 distributed naturally)
    spawnProp('plant', 0, 0.6, 0.5); // Plant on coffee table
    spawnProp('plant', -14.0, 0.85, -13.8); // Plant on nightstand
    spawnProp('plant', 12.5, 1.37, -12.5); // Plant on study desk
    spawnProp('plant', 15.0, 1.3, -4.0); // Plant on drafting desk
    spawnProp('plant', -16.5, 0, -5.0); // Floor plant near bed
    spawnProp('plant', -16.5, 0, 10.5); // Floor plant near wardrobe
    spawnProp('plant', 6.0, 0, -14.0); // Floor plant near TV

    // Chairs (5 comfortable chairs)
    spawnProp('chair', 14.5, 0, -10.5, Math.PI); // Desk chair
    spawnProp('chair', 15.0, 0, -2.0, Math.PI); // Drafting chair
    spawnProp('chair', -3.8, 0, 0.5, Math.PI / 2); // Armchair left
    spawnProp('chair', 3.8, 0, 0.5, -Math.PI / 2); // Armchair right
    spawnProp('chair', -8.5, 0, 10.0, 0.6); // Chair near dresser

    // Laundry baskets (3 baskets)
    spawnProp('basket', -11.0, 0, 13.5, 0.2); // Hamper near wardrobe
    spawnProp('basket', -16.5, 0, -8.0, -0.3); // Basket near bed
    spawnProp('basket', 12.0, 0, 4.5, -0.2); // Storage basket

    // Books and book stacks (5 book props)
    spawnProp('books', 16.0, 1.37, -12.2, 0.2); // Books on study desk
    spawnProp('books', 13.8, 1.3, -4.0, -0.3); // Books on drafting table
    spawnProp('books', -1.0, 0.6, 0.5, 0.4); // Books on coffee table
    spawnProp('books', -14.0, 0.85, -8.2, 0.1); // Books on nightstand
    spawnProp('books', 18.0, 1.4, 6.5, 0); // Books on shelf

    // Bottles / thermos / cans (4 bottles)
    spawnProp('bottle', 16.5, 1.37, -12.8); // Bottle on desk
    spawnProp('bottle', 1.0, 0.6, 0.5); // Water bottle on coffee table
    spawnProp('bottle', -7.8, 1.5, 14.8); // Bottle on dresser
    spawnProp('bottle', 18.0, 2.6, 8.5); // Bottle on bookshelf

    // Lamps (standing & desk - 3 lamps)
    spawnProp('lamp', -16.5, 0, -13.8); // Corner lamp beside bed
    spawnProp('lamp', 17.5, 0, -13.8); // Corner lamp at desk
    spawnProp('lamp', -3.5, 0, -6.5); // Floor reading lamp

    // Teddy bears (3 bears)
    spawnProp('bear', -12.5, 0.9, -11.0, -0.4); // Bear on bed!
    spawnProp('bear', -3.8, 0.55, 0.5, 0.2); // Bear on armchair!
    spawnProp('bear', 10.5, 0, 10.5, 0.5); // Bear by storage area

    // --- Bright, Beautiful Room Lighting ---
    const ambLight = new THREE.AmbientLight(0xffecd2, 1.05);
    lights.push(ambLight);
    group.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xffe2b8, 1.3);
    dirLight.position.set(10, 18, 12);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;
    dirLight.shadow.camera.left = -22;
    dirLight.shadow.camera.right = 22;
    dirLight.shadow.camera.top = 22;
    dirLight.shadow.camera.bottom = -22;
    lights.push(dirLight);
    group.add(dirLight);

    // Warm cozy ambient point lights for perfect corner visibility
    const warmLamp1 = new THREE.PointLight(0xffa737, 1.8, 18);
    warmLamp1.position.set(-16.5, 2.8, -13.8);
    lights.push(warmLamp1);
    group.add(warmLamp1);

    const warmLamp2 = new THREE.PointLight(0xffa737, 1.6, 18);
    warmLamp2.position.set(17.5, 2.8, -13.8);
    lights.push(warmLamp2);
    group.add(warmLamp2);

    return {
      group,
      staticColliders,
      interactableProps,
      seekerSpawn: new THREE.Vector3(-15.0, 0, 0),
      hiderSpawns: [
        new THREE.Vector3(0, 0, 5.0),
        new THREE.Vector3(9.5, 0, -6.5),
        new THREE.Vector3(-6.5, 0, 8.5),
        new THREE.Vector3(10.0, 0, 8.0),
        new THREE.Vector3(-12.0, 0, -4.5),
      ],
      mapSize: { minX, maxX, minZ, maxZ },
      lights,
      ambientColor: 0xffecd2,
    };
  }

  // --- 2. GARDEN PATIO / PLAYGROUND ---
  private static buildGardenMap(): MapData {
    const group = new THREE.Group();
    const staticColliders: THREE.Box3[] = [];
    const interactableProps: StaticProp[] = [];
    const lights: THREE.Light[] = [];

    // 1.5x enlarged garden boundaries: 45m x 36m
    const minX = -22.5, maxX = 22.5, minZ = -18, maxZ = 18, height = 4.2;

    // Grass floor
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x3d7a36, roughness: 0.9 });
    const grass = new THREE.Mesh(new THREE.PlaneGeometry(45, 36), grassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.receiveShadow = true;
    group.add(grass);

    // Timber decking patio area
    const deckMat = new THREE.MeshStandardMaterial({ color: 0x8a5b3a, roughness: 0.6 });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(20, 0.12, 20), deckMat);
    deck.position.set(-4, 0.06, 0);
    deck.receiveShadow = true;
    group.add(deck);

    // Stone perimeter wall with hedge
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x82847c, roughness: 0.8 });
    const hedgeMat = new THREE.MeshStandardMaterial({ color: 0x225522, roughness: 0.9 });

    const createFence = (w: number, h: number, d: number, x: number, y: number, z: number) => {
      const stone = new THREE.Mesh(new THREE.BoxGeometry(w, 1.4, d), wallMat);
      stone.position.set(x, 0.7, z);
      const hedge = new THREE.Mesh(new THREE.BoxGeometry(w, h - 1.4, d), hedgeMat);
      hedge.position.set(x, 1.4 + (h - 1.4) / 2, z);
      stone.receiveShadow = true;
      hedge.castShadow = true;
      group.add(stone, hedge);
      staticColliders.push(new THREE.Box3().setFromObject(stone));
      staticColliders.push(new THREE.Box3().setFromObject(hedge));
    };

    createFence(45.4, height, 0.5, 0, 0, minZ - 0.25);
    createFence(45.4, height, 0.5, 0, 0, maxZ + 0.25);
    createFence(0.5, height, 36.4, minX - 0.25, 0, 0);
    createFence(0.5, height, 36.4, maxX + 0.25, 0, 0);

    // Outdoor comfortable sofa & coffee table
    const sofa = new THREE.Mesh(
      new THREE.BoxGeometry(6.5, 1.0, 2.0),
      new THREE.MeshStandardMaterial({ color: 0xc9baa2, roughness: 0.8 })
    );
    sofa.position.set(-4, 0.5, -6.5);
    sofa.castShadow = true;
    group.add(sofa);
    staticColliders.push(new THREE.Box3().setFromObject(sofa));

    // Patio Umbrella
    const umbrellaGroup = new THREE.Group();
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 4.6, 8),
      new THREE.MeshStandardMaterial({ color: 0x444444 })
    );
    pole.position.set(-4, 2.3, 0);
    const canopy = new THREE.Mesh(
      new THREE.ConeGeometry(4.4, 1.2, 8),
      new THREE.MeshStandardMaterial({ color: 0xddcbb5, roughness: 0.7, side: THREE.DoubleSide })
    );
    canopy.position.set(-4, 4.2, 0);
    umbrellaGroup.add(pole, canopy);
    group.add(umbrellaGroup);
    staticColliders.push(new THREE.Box3().setFromObject(umbrellaGroup));

    // Barbecue Grill Station
    const grill = new THREE.Mesh(
      new THREE.CylinderGeometry(1.0, 0.75, 1.2, 16),
      new THREE.MeshStandardMaterial({ color: 0x1f1f1f, metalness: 0.8, roughness: 0.3 })
    );
    grill.position.set(12.5, 1.1, -11.5);
    grill.castShadow = true;
    group.add(grill);
    staticColliders.push(new THREE.Box3().setFromObject(grill));

    // Picnic Table with Benches (East Lawn)
    const picnicMat = new THREE.MeshStandardMaterial({ color: 0x6e472a, roughness: 0.7 });
    const pTable = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.9, 2.4), picnicMat);
    pTable.position.set(11.5, 0.45, 5.0);
    pTable.castShadow = true;
    group.add(pTable);
    staticColliders.push(new THREE.Box3().setFromObject(pTable));

    // Natural Props in Garden (~20% reduced for clean feel)
    const spawnProp = (propType: string, x: number, y: number, z: number, rotY: number = 0) => {
      const pMesh = createPropMesh(propType);
      pMesh.position.set(x, y, z);
      pMesh.rotation.y = rotY;
      group.add(pMesh);

      const propData: StaticProp = {
        id: `garden_${propType}_${Math.random().toString(36).substring(2, 7)}`,
        propType,
        mesh: pMesh,
        bounds: new THREE.Box3().setFromObject(pMesh),
        isPlayerProp: false,
      };
      interactableProps.push(propData);
      staticColliders.push(propData.bounds);
    };

    // Plants & Planters (7 plants)
    spawnProp('plant', -4.0, 0.12, 0, 0); // Plant under umbrella
    spawnProp('plant', 12.5, 0, 5.0);
    spawnProp('plant', -14.5, 0, 9.0);
    spawnProp('plant', -10.0, 0, -9.5);
    spawnProp('plant', 17.0, 0, -12.0);
    spawnProp('plant', 16.5, 0, 12.5);
    spawnProp('plant', -17.5, 0, 0);

    // Watering cans (3 cans)
    spawnProp('watering_can', 10.0, 0, -10.5, -0.4);
    spawnProp('watering_can', -13.0, 0, 4.5, 0.8);
    spawnProp('watering_can', 14.5, 0, 7.0, 0.2);

    // Boxes & Crates (5 boxes)
    spawnProp('box', 11.5, 0, 13.5, 0.2);
    spawnProp('box', 12.5, 0, 13.2, -0.3);
    spawnProp('box', 12.0, 0.75, 13.4, 0.4); // Stacked
    spawnProp('box', -18.5, 0, 11.5, 0.5);
    spawnProp('box', 17.0, 0, 1.0, 0.3);

    // Chairs & Loungers (5 chairs)
    spawnProp('chair', -8.5, 0.12, 0.5, 1.2);
    spawnProp('chair', 0.5, 0.12, 0.5, -1.2);
    spawnProp('chair', 8.5, 0, 5.0, Math.PI / 2);
    spawnProp('chair', 14.5, 0, 5.0, -Math.PI / 2);
    spawnProp('chair', -4.0, 0.12, 4.5, 0);

    // Garden lanterns (3 lamps)
    spawnProp('lamp', 6.5, 0, -4.5);
    spawnProp('lamp', -11.0, 0, -4.5);
    spawnProp('lamp', 16.5, 0, 14.0);

    // Baskets & bottles (4 props)
    spawnProp('basket', -2.0, 0.12, -6.5);
    spawnProp('basket', 11.5, 0.9, 5.0);
    spawnProp('bottle', 12.2, 0.9, 5.0);
    spawnProp('bottle', -3.5, 0.5, -6.5);

    // Toys / Bears (2 bears)
    spawnProp('bear', 14.0, 0, 11.0);
    spawnProp('bear', -7.0, 0.5, -6.5);

    // Sunset / twilight warm sky lighting
    const ambLight = new THREE.AmbientLight(0xffdfba, 0.95);
    lights.push(ambLight);
    group.add(ambLight);

    const sun = new THREE.DirectionalLight(0xff9944, 1.8);
    sun.position.set(-18, 22, -18);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    lights.push(sun);
    group.add(sun);

    const stringLight = new THREE.PointLight(0xffbb55, 2.0, 20);
    stringLight.position.set(-4, 3.5, 0);
    lights.push(stringLight);
    group.add(stringLight);

    return {
      group,
      staticColliders,
      interactableProps,
      seekerSpawn: new THREE.Vector3(-16.0, 0, -10.0),
      hiderSpawns: [
        new THREE.Vector3(4.0, 0, 4.0),
        new THREE.Vector3(-8.0, 0, 6.5),
        new THREE.Vector3(8.0, 0, -4.0),
        new THREE.Vector3(14.0, 0, 7.0),
        new THREE.Vector3(-11.0, 0, -5.5),
      ],
      mapSize: { minX, maxX, minZ, maxZ },
      lights,
      ambientColor: 0xffdfba,
    };
  }

  // --- 3. SUPERMARKET / STORE ---
  private static buildSupermarketMap(): MapData {
    const group = new THREE.Group();
    const staticColliders: THREE.Box3[] = [];
    const interactableProps: StaticProp[] = [];
    const lights: THREE.Light[] = [];

    // 1.5x enlarged boundaries: 48m x 36m
    const minX = -24, maxX = 24, minZ = -18, maxZ = 18, height = 5.6;

    // Shiny Supermarket Tiles
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xefefef,
      roughness: 0.18,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(48, 36), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    group.add(floor);

    // Supermarket walls
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xd8e2dc, roughness: 0.6 });
    const createWall = (w: number, h: number, d: number, x: number, y: number, z: number) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
      mesh.position.set(x, y, z);
      mesh.receiveShadow = true;
      group.add(mesh);
      staticColliders.push(new THREE.Box3().setFromObject(mesh));
    };

    createWall(48.4, height, 0.4, 0, height / 2, minZ - 0.2);
    createWall(48.4, height, 0.4, 0, height / 2, maxZ + 0.2);
    createWall(0.4, height, 36.4, minX - 0.2, height / 2, 0);
    createWall(0.4, height, 36.4, maxX + 0.2, height / 2, 0);

    // Supermarket Aisles (Tall double-sided shelves)
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x3d5a80, roughness: 0.5 });
    const cerealColors = [0xe76f51, 0xf4a261, 0x2a9d8f, 0xe9c46a, 0x457b9d];

    const createAisle = (x: number, z: number, length: number) => {
      const aisle = new THREE.Group();
      const frame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.6, length), shelfMat);
      frame.position.set(0, 1.8, 0);
      frame.castShadow = true;
      aisle.add(frame);

      // Colorful packaged goods along both sides
      for (let side = -1; side <= 1; side += 2) {
        for (let shelfLvl = 0; shelfLvl < 4; shelfLvl++) {
          for (let itemIdx = 0; itemIdx < 8; itemIdx++) {
            const boxColor = cerealColors[(shelfLvl + itemIdx) % cerealColors.length];
            const item = new THREE.Mesh(
              new THREE.BoxGeometry(0.25, 0.45, 0.55),
              new THREE.MeshStandardMaterial({ color: boxColor, roughness: 0.4 })
            );
            item.position.set(
              side * 1.25,
              0.6 + shelfLvl * 0.8,
              -length / 2 + 1.2 + itemIdx * (length / 8.5)
            );
            aisle.add(item);
          }
        }
      }

      aisle.position.set(x, 0, z);
      group.add(aisle);
      staticColliders.push(new THREE.Box3().setFromObject(aisle));
    };

    // 4 parallel aisles across the grocery floor
    createAisle(-12.0, -1.0, 20.0);
    createAisle(-4.0, -1.0, 20.0);
    createAisle(4.0, -1.0, 20.0);
    createAisle(12.0, -1.0, 20.0);

    // Checkout counters along south area
    const checkoutMat = new THREE.MeshStandardMaterial({ color: 0x293241, roughness: 0.4 });
    const createCheckout = (x: number, z: number) => {
      const chk = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.15, 1.4), checkoutMat);
      chk.position.set(x, 0.58, z);
      chk.castShadow = true;
      group.add(chk);
      staticColliders.push(new THREE.Box3().setFromObject(chk));
    };
    createCheckout(-10.0, 13.5);
    createCheckout(-2.0, 13.5);
    createCheckout(6.0, 13.5);

    // "SUPERMARKET" Overhead Sign in center north
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(8.0, 1.5, 0.15),
      new THREE.MeshStandardMaterial({ color: 0x2a9d8f, emissive: 0x13534b, emissiveIntensity: 0.3 })
    );
    sign.position.set(0, 4.6, minZ + 0.4);
    group.add(sign);

    // Natural Props in Supermarket (~20% reduced for clean, open aisles)
    const spawnProp = (propType: string, x: number, y: number, z: number, rotY: number = 0) => {
      const pMesh = createPropMesh(propType);
      pMesh.position.set(x, y, z);
      pMesh.rotation.y = rotY;
      group.add(pMesh);

      const propData: StaticProp = {
        id: `supermarket_${propType}_${Math.random().toString(36).substring(2, 7)}`,
        propType,
        mesh: pMesh,
        bounds: new THREE.Box3().setFromObject(pMesh),
        isPlayerProp: false,
      };
      interactableProps.push(propData);
      staticColliders.push(propData.bounds);
    };

    // Stacks of delivery boxes (8 boxes)
    spawnProp('box', 19.0, 0, -12.0, 0.2);
    spawnProp('box', 20.0, 0, -12.5, -0.4);
    spawnProp('box', 19.5, 0.75, -12.2, 0.5); // Stacked
    spawnProp('box', 19.0, 0, 6.0, 0.1);
    spawnProp('box', 19.8, 0, 6.5, -0.2);
    spawnProp('box', -20.0, 0, -13.0, 0.3);
    spawnProp('box', -7.5, 0, -14.0, 0.2);
    spawnProp('box', 8.5, 0, -14.0, 0.1);

    // Shopping baskets (6 baskets)
    spawnProp('basket', -10.0, 1.18, 13.5); // On checkout 1
    spawnProp('basket', -2.0, 1.18, 13.5); // On checkout 2
    spawnProp('basket', 6.0, 1.18, 13.5); // On checkout 3
    spawnProp('basket', -16.0, 0, 13.5);
    spawnProp('basket', 12.0, 0, 13.5);
    spawnProp('basket', 0, 0, -4.0);

    // Bottles & drinks (4 bottles)
    spawnProp('bottle', -11.0, 1.18, 13.5);
    spawnProp('bottle', -3.0, 1.18, 13.5);
    spawnProp('bottle', 5.0, 1.18, 13.5);
    spawnProp('bottle', 19.0, 0, -3.0);

    // Produce & Decorative Plants (4 plants)
    spawnProp('plant', 20.0, 0, 14.0);
    spawnProp('plant', -20.0, 0, 14.0);
    spawnProp('plant', -20.0, 0, -6.0);
    spawnProp('plant', 20.0, 0, -6.0);

    // Chairs / Stools at registers (3 chairs)
    spawnProp('chair', -10.0, 0, 15.0, 0);
    spawnProp('chair', -2.0, 0, 15.0, 0);
    spawnProp('chair', 6.0, 0, 15.0, 0);

    // Books / Magazines rack (2 books)
    spawnProp('books', -14.0, 0, 11.5, 0.2);
    spawnProp('books', 10.0, 0, 11.5, -0.3);

    // Toy section bear (2 bears)
    spawnProp('bear', 17.0, 0, -11.0);
    spawnProp('bear', 0, 0, 10.5);

    // Bright modern store lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 1.05);
    lights.push(ambLight);
    group.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xfff6ea, 1.25);
    dirLight.position.set(0, 20, 6);
    dirLight.castShadow = true;
    lights.push(dirLight);
    group.add(dirLight);

    return {
      group,
      staticColliders,
      interactableProps,
      seekerSpawn: new THREE.Vector3(-19.0, 0, -9.0),
      hiderSpawns: [
        new THREE.Vector3(-7.5, 0, 4.5),
        new THREE.Vector3(0.0, 0, -6.0),
        new THREE.Vector3(8.5, 0, 3.0),
        new THREE.Vector3(16.0, 0, 0.0),
        new THREE.Vector3(-16.0, 0, 1.5),
      ],
      mapSize: { minX, maxX, minZ, maxZ },
      lights,
      ambientColor: 0xffffff,
    };
  }
}
