function main() {
  // Initialisation

  const width = window.innerWidth;
  const height = window.innerHeight;

  // Reference: https://threejs.org/docs/#api/en/scenes/Scene

  const scene = new THREE.Scene();

  // Reference: https://threejs.org/docs/#api/en/core/Clock

  const clock = new THREE.Clock();

  // Reference: https://threejs.org/docs/#api/en/loaders/TextureLoader

  const textureLoader = new THREE.TextureLoader();

  // Reference: https://threejs.org/docs/#api/en/cameras/PerspectiveCamera

  const camera = new THREE.PerspectiveCamera(100, width / height, 0.1, 1000);

  // Reference: https://threejs.org/docs/?q=web%20ren#api/en/renderers/WebGLRenderer

  const renderer = new THREE.WebGLRenderer({ antialias: true });

  // Reference: https://threejs.org/docs/?q=orbit#examples/en/controls/OrbitControls

  const controls = new THREE.OrbitControls(camera, renderer.domElement);

  // Reference: https://threejs.org/docs/?q=webgl#api/en/renderers/WebGLCubeRenderTarget

  const cubeTarget = new THREE.WebGLCubeRenderTarget(256, {
    format: THREE.RGBFormat,
    generateMipmaps: true,
  });

  // Reference: https://threejs.org/docs/?q=cube#api/en/cameras/CubeCamera

  const cubeCamera = new THREE.CubeCamera(1, 1000, cubeTarget);

  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  document.body.appendChild(renderer.domElement);

  camera.position.set(0, 0, 1);
  camera.lookAt(0, -1, 0);

  controls.update();

  // Reference: https://threejs.org/docs/#api/en/math/Color

  scene.background = new THREE.Color(0xd93323);

  scene.add(cubeCamera);

  // Booleans

  let startTrunks = true;
  let startBranches = false;
  let startLeaves = false;
  let branchesComplete = false;
  let leavesComplete = false;

  // Shaders
  // Reference: https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_on_the_web/GLSL_Shaders

  let backgroundVertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

  let backgroundFragment = `
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    float len = length(uv);
    vec3 color1 = vec3(0.1725, 0.0353, 0.0118);
    vec3 color2 = vec3(0.7843, 0.1647, 0.0196);
    vec3 color = mix(color1, color2, len);
    gl_FragColor = vec4(color, 1.0);
  }
`;

  const hazeVertex = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

  const hazeFragment = `
      varying vec2 vUv;
      float random(vec2 uv) {
        return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
      }
      void main() {
        float noise = random(vUv * 10.0);
        float factor = smoothstep(0.0, 1.0, vUv.y * 2.0);
        vec3 color1 = vec3(0.949, 0.772, 0.580);
        vec3 color2 = vec3(0.910, 0.466, 0.200);
        vec3 color = mix(color1, color2, factor);
        gl_FragColor = vec4(color * noise, 0.1);
      }
    `;

  // Textures

  const treeTexture = textureLoader.load(
    'assets/trunkRed.png',
    function (texture) {
      texture.receiveShadow = true;
      texture.castShadow = true;
    }
  );

  const leafTexture = textureLoader.load(
    'assets/leafRed.jpg',
    function (texture) {
      texture.receiveShadow = true;
      texture.castShadow = true;
    }
  );

  const moonTexture = textureLoader.load('assets/moonRed.jpg');

  const groundTexture = textureLoader.load(
    'assets/groundRed.jpg',
    function (texture) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(25, 25);
      texture.receiveShadow = true;
      texture.castShadow = true;
    }
  );

  const crossTexture = textureLoader.load(
    'assets/crossRed.jpg',
    function (texture) {
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.receiveShadow = true;
      texture.castShadow = true;
    }
  );

  // Materials

  // Reference: https://threejs.org/docs/?q=mesh%20basic#api/en/materials/MeshBasicMaterial

  const treeMaterial = new THREE.MeshBasicMaterial({
    map: treeTexture,
    side: THREE.DoubleSide,
  });

  const leafMaterial = new THREE.MeshBasicMaterial({
    map: leafTexture,
    side: THREE.DoubleSide,
  });

  const moonMaterial = new THREE.MeshBasicMaterial({ map: moonTexture });

  const crossMaterial = new THREE.MeshBasicMaterial({ map: crossTexture });

  const pondMaterial = new THREE.MeshBasicMaterial({
    envMap: cubeTarget.texture,
    combine: THREE.MixOperation,
    reflectivity: 0.9,
  });

  const grassMaterial = new THREE.MeshBasicMaterial({
    color: 0x541303,
  });

  const birdMaterial = new THREE.MeshBasicMaterial({
    color: 0x631505,
    side: THREE.DoubleSide,
  });

  // Reference: https://threejs.org/docs/?q=mesh%20stand#api/en/materials/MeshStandardMaterial

  const groundMaterial = new THREE.MeshStandardMaterial({
    map: groundTexture,
    side: THREE.DoubleSide,
  });

  // Reference: https://threejs.org/docs/?q=points#api/en/materials/PointsMaterial

  const mistMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.0001,
    transparent: true,
    opacity: 0.05,
  });

  // Reference: https://threejs.org/docs/?q=shader%20ma#api/en/materials/ShaderMaterial

  const backgroundMaterial = new THREE.ShaderMaterial({
    vertexShader: backgroundVertex,
    fragmentShader: backgroundFragment,
    side: THREE.DoubleSide,
  });

  const hazeMaterial = new THREE.ShaderMaterial({
    vertexShader: hazeVertex,
    fragmentShader: hazeFragment,
    transparent: true,
    side: THREE.DoubleSide,
    opacity: 0.1,
  });

  // Functions

  function getCoordinates() {
    const x = Math.random() * 25 - 25 / 2;
    const z = Math.random() * 25 - 25 / 2;
    const y = -2;

    // Reference: https://threejs.org/docs/?q=vector3#api/en/math/Vector3

    return new THREE.Vector3(x, y, z);
  }

  function checkCoordinates(coordinates, camera, radius) {
    const distance = coordinates.distanceTo(camera.position);
    return distance <= radius;
  }

  function modifyMesh(mesh, y, z) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.rotation.y = y;
    mesh.rotation.z = z;
  }

  // Trees

  let trunks = [];
  let treeCount = 15;

  function createTrunk(x, y, z) {
    // Reference: https://threejs.org/docs/?q=group#api/en/objects/Group

    const trunk = new THREE.Group();

    trunk.position.set(x, y, z);
    trunk.receiveShadow = true;
    trunk.castShadow = true;
    trunks.push(trunk);
    scene.add(trunk);
  }

  for (let i = 0; i < treeCount; i++) {
    function createTree() {
      const coordinates = getCoordinates();
      if (!checkCoordinates(coordinates, camera, 8) && coordinates.x != -8 && coordinates.z != -8) {
        createTrunk(coordinates.x, coordinates.y, coordinates.z);
      } else {
        createTree();
      }
    }
    createTree();
  }

  function growTrunks() {
    trunks.forEach((trunk) => {
      const thickness = height / (1500 * 4);
      const maxHeight = 30;
      const decayFactor = 0.995;
      let currentHeight = trunk.children.length * thickness;
      if (currentHeight < maxHeight) {
        let previousRadius =
          trunk.children.length > 0
            ? trunk.children[trunk.children.length - 1].geometry.parameters
                .radiusTop
            : Math.random() * 0.2 + 0.9;
        let radiusTop = previousRadius * (Math.random() * 0.15 + 0.9);
        let radiusBottom = previousRadius;
        let cylinderHeight = thickness;

        // Reference: https://threejs.org/docs/?q=cyli#api/en/geometries/CylinderGeometry

        let cylinderGeometry = new THREE.CylinderGeometry(
          radiusTop,
          radiusBottom,
          cylinderHeight,
          32
        );

        // Reference: https://threejs.org/docs/?q=mesh#api/en/objects/Mesh

        const trunkMesh = new THREE.Mesh(cylinderGeometry, treeMaterial);

        trunkMesh.position.set(
          trunk.children.length > 0
            ? trunk.children[trunk.children.length - 1].position.x +
                (Math.random() - 0.5) *
                  0.3 *
                  Math.pow(decayFactor, trunk.children.length)
            : 0,
          currentHeight,
          trunk.children.length > 0
            ? trunk.children[trunk.children.length - 1].position.z +
                (Math.random() - 0.5) *
                  0.3 *
                  Math.pow(decayFactor, trunk.children.length)
            : 0
        );
        trunkMesh.rotation.y = Math.random() * Math.PI * 2;
        trunkMesh.castShadow = true;
        trunkMesh.receiveShadow = true;
        trunk.add(trunkMesh);
      }
      if (currentHeight >= maxHeight) {
        startBranches = true;
        startTrunks = false;
        createBranch();
      }
    });
  }

  // Branches

  let pivots = [];
  let branches = [];

  for (let i = 0; i < treeCount; i++) {
    pivots.push([]);
    branches.push([]);
  }

  function createBranch() {
    trunks.forEach((trunk, index) => {
      pivots[index] = [];
      branches[index] = [];
      for (let i = 0; i < 10; i++) {
        const pivot = new THREE.Group();
        const branch = new THREE.Group();
        const cylinderY = Math.floor(Math.random() * (17 - 5 + 1)) + 5;
        const rotationY = Math.random() * Math.PI * 2;
        const cylinder = trunk.children.find(
          (c) =>
            cylinderY >= c.position.y &&
            cylinderY < c.position.y + c.geometry.parameters.height
        );
        branch.rotation.y = rotationY;
        cylinder.add(pivot);
        pivot.add(branch);
        pivots[index].push(cylinder);
        branches[index].push(branch);
      }
    });
  }

  function growBranches() {
    trunks.forEach((trunk, index) => {
      const randomBoolean = Math.random() < 0.5;
      const thickness = width / (1500 * 8);
      let branchCount = 0;
      let cylinderY = 0;
      branches[index].forEach((branch, i) => {
        const maxWidth = Math.random() * 10 + 5;
        const decayFactor = 0.99;
        const cylinder = trunk.children.find(
          (c) =>
            cylinderY >= c.position.y &&
            cylinderY < c.position.y + c.geometry.parameters.height
        );
        let currentWidth = branch.children.length * thickness;
        if (currentWidth >= maxWidth) {
          branchesComplete = true;
          branchCount++;
          if (branchCount == branches[index].length) {
            startBranches = false;
            return;
          }
          return;
        }
        if (currentWidth < maxWidth) {
          let previousRadius =
            branch.children.length > 0
              ? branch.children[branch.children.length - 1].geometry.parameters
                  .radiusTop
              : (pivots[index][i].geometry.parameters.radiusTop / 3) * 2;
          let radiusTop = previousRadius * (Math.random() * 0.3 + 0.8);
          let radiusBottom = previousRadius;
          let cylinderWidth = thickness;
          let cylinderGeometry = new THREE.CylinderGeometry(
            radiusTop,
            radiusBottom,
            cylinderWidth,
            32
          );
          const branchMesh = new THREE.Mesh(cylinderGeometry, treeMaterial);
          let previousCylinder =
            branch.children.length > 0
              ? branch.children[branch.children.length - 1]
              : cylinder;
          if (randomBoolean) {
            branchMesh.position.y =
              previousCylinder.position.y +
              pivots[index][i].geometry.parameters.height / 2 +
              cylinderWidth / 2 +
              Math.random() * 0.02 -
              0.01 * Math.pow(decayFactor, branch.children.length);
            branchMesh.position.x =
              previousCylinder.position.x + Math.random() * 0.02 - 0.01;
            branchMesh.position.z =
              previousCylinder.position.z +
              cylinderWidth / 2 +
              Math.random() * 0.02 -
              0.01 * Math.pow(decayFactor, branch.children.length);
            branchMesh.rotation.x = Math.PI / 4;
          } else {
            branchMesh.position.y =
              previousCylinder.position.y +
              pivots[index][i].geometry.parameters.height / 2 +
              cylinderWidth / 2 +
              Math.random() * 0.02 -
              0.01 * Math.pow(decayFactor, branch.children.length);
            branchMesh.position.x =
              previousCylinder.position.x +
              cylinderWidth / 2 +
              Math.random() * 0.02 -
              0.01 * Math.pow(decayFactor, branch.children.length);
            branchMesh.position.z =
              previousCylinder.position.z + Math.random() * 0.02 - 0.01;
            branchMesh.rotation.x = -Math.PI / 4;
          }
          branchMesh.receiveShadow = true;
          branchMesh.castShadow = true;
          branch.add(branchMesh);
        }
      });
    });
  }

  function updateBranches() {
    if (branchesComplete) {
      growLeaves();
      branchesComplete = false;
    }
  }

  // Leaves

  let leaves = [];
  let leafVelocities = [];

  function createLeaf() {
    // Reference: https://threejs.org/docs/?q=shape#api/en/extras/core/Shape

    const leafShape = new THREE.Shape();

    leafShape.moveTo(0, 0);
    leafShape.quadraticCurveTo(0.2, 0.2, 0.6, 0);
    leafShape.quadraticCurveTo(0.2, -0.2, 0, 0);

    // Reference: https://threejs.org/docs/?q=shape#api/en/geometries/ShapeGeometry

    const leafGeometry = new THREE.ShapeGeometry(leafShape);

    const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
    let leafVelocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.2,
      -Math.random() * 0.05,
      (Math.random() - 0.5) * 0.2
    );
    leaf.receiveShadow = true;
    leaf.castShadow = true;
    leaves.push(leaf);
    leafVelocities.push(leafVelocity);
    return leaf;
  }

  function growLeaves() {
    trunks.forEach((trunk, index) => {
      setTimeout(() => {
        for (let i = 0; i < pivots[index].length * 10; i++) {
          setTimeout(() => {
            const pivot = pivots[index];
            const x = trunk.position.x + pivot[i].position.x;
            const y = pivot[i].position.y + 3;
            const z = trunk.position.z + pivot[i].position.z;
            const leaf = createLeaf();
            const radius = Math.random() * 4;
            const angle = Math.random() * Math.PI * 2;
            const offsetX = radius * Math.cos(angle);
            const offsetZ = radius * Math.sin(angle);
            leaf.position.set(x + offsetX, y + Math.random() * 2, z + offsetZ);
            leaf.rotation.x = Math.random() * Math.PI * 2;
            leaf.rotation.y = Math.random() * Math.PI * 2;
            leaf.rotation.z = Math.random() * Math.PI * 2;
            scene.add(leaf);
          }, 1000);
        }
      }, 10000);
    });
    leavesComplete = true;
  }

  // Moon

  // Reference: https://threejs.org/docs/?q=sphere#api/en/geometries/SphereGeometry

  const moonGeometry = new THREE.SphereGeometry(10, 32, 32);

  const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);

  const moonRadius = 100;
  const moonSpeed = 0.001;

  let moonAngle = 200;

  scene.add(moonMesh);

  function updateMoon() {
    moonAngle += moonSpeed;
    moonMesh.position.set(
      moonRadius * Math.cos(moonAngle),
      75,
      moonRadius * Math.sin(moonAngle)
    );
  }

  // Light

  // Reference: https://threejs.org/docs/?q=pointl#api/en/lights/PointLight

  const moonGlow = new THREE.PointLight(0xf0cfa7, 1, 10);

  // Reference: https://threejs.org/docs/?q=direc#api/en/lights/DirectionalLight

  const moonLight = new THREE.DirectionalLight(0xf6c69e, 1);

  moonLight.castShadow = true;
  moonLight.shadow.camera.left = -50;
  moonLight.shadow.camera.right = 50;
  moonLight.shadow.camera.top = 50;
  moonLight.shadow.camera.bottom = -50;

  scene.add(moonGlow);
  scene.add(moonLight);

  function updateLight() {
    const { x, y, z } = moonMesh.position;
    moonLight.position.set(x, y, z);
    moonGlow.position.set(x, y, z);
  }

  // Ground
  // Reference: https://woodenraft.games/blog/generating-terrain-plane-geometry-three-js

  const numberX = 25;
  const numberZ = 25;
  const size = 2;
  const sizeX = size * numberX;
  const sizeZ = size * numberZ;
  const totalX = numberX + 1;
  const totalZ = numberZ + 1;

  // Reference: https://threejs.org/docs/?q=plane#api/en/geometries/PlaneGeometry

  const groundGeometry = new THREE.PlaneGeometry(
    sizeX,
    sizeZ,
    numberX,
    numberZ
  );

  groundGeometry.rotateX(Math.PI * -0.5);

  const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);

  groundMesh.position.y = -2;
  groundMesh.receiveShadow = true;

  for (let i = 0; i < totalZ; i++) {
    for (let j = 0; j < totalX; j++) {
      const index = 3 * (i * totalX + j);
      groundGeometry.attributes.position.array[index + 1] = Math.random();
    }
  }

  scene.add(groundMesh);

  // Cross

  function createCross() {
    const radiansY = THREE.MathUtils.degToRad(45);
    const radiansZ = THREE.MathUtils.degToRad(5);
    const coordinates = new THREE.Vector3(-8, 2, -8);
    if (!checkCoordinates(coordinates, camera, 6.5)) {
      // Reference: https://threejs.org/docs/?q=box%20ge#api/en/geometries/BoxGeometry

      const horizontalGeometry = new THREE.BoxGeometry(3, 0.45, 0.45);

      const horizontalMesh = new THREE.Mesh(horizontalGeometry, crossMaterial);
      const verticalGeometry = new THREE.BoxGeometry(0.5, 5, 0.5);
      const verticalMesh = new THREE.Mesh(verticalGeometry, crossMaterial);
      horizontalMesh.position.set(-8, 2, -8);
      verticalMesh.position.set(-8, 1, -8);
      modifyMesh(horizontalMesh, radiansY, radiansZ);
      modifyMesh(verticalMesh, radiansY, radiansZ);
      scene.add(horizontalMesh);
      scene.add(verticalMesh);
    } else {
      createCross();
    }
  }

  createCross();

  // Pond

  function createPond() {
    const pondShape = new THREE.Shape();
    const radius = 7;
    const noiseScale = 0.5;
    for (let i = 0; i <= 256; i++) {
      const degrees = (i / 256) * Math.PI * 2;
      const x = radius * Math.cos(degrees);
      const y = radius * Math.sin(degrees);

      // Reference: https://github.com/josephg/noisejs

      const noiseValue = noise.perlin2(x * noiseScale, y * noiseScale);

      const noiseX = x + noiseValue * radius * 0.2;
      const noiseY = y + noiseValue * radius * 0.2;
      if (i === 0) {
        pondShape.moveTo(noiseX, noiseY);
      } else {
        pondShape.lineTo(noiseX, noiseY);
      }
    }
    const pondGeometry = new THREE.ShapeGeometry(pondShape);
    const pondMesh = new THREE.Mesh(pondGeometry, pondMaterial);
    pondMesh.rotation.x = -Math.PI / 2;
    pondMesh.position.y = -1;
    return pondMesh;
  }

  const pondMesh = createPond();

  scene.add(pondMesh);

  function updatePond() {
    pondMesh.visible = false;
    cubeCamera.position.copy(pondMesh.position);
    cubeCamera.update(renderer, scene);
    pondMesh.visible = true;
  }

  // Mist

  const mistCount = 1000000;

  // Reference: https://threejs.org/docs/?q=buffer#api/en/core/BufferGeometry

  const mistGeometry = new THREE.BufferGeometry();

  const coordinates = new Float32Array(mistCount * 3);
  const movement = new Float32Array(mistCount);

  for (let i = 0; i < mistCount; i++) {
    coordinates[i * 3] = Math.random() * 50 - 25;
    coordinates[i * 3 + 1] = Math.random() * 6 - 4;
    coordinates[i * 3 + 2] = Math.random() * 50 - 25;
    movement[i] = Math.random() * 0.01;
  }

  // Reference: https://threejs.org/docs/?q=buffer#api/en/core/BufferAttribute

  mistGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(coordinates, 3)
  );

  mistGeometry.setAttribute('movement', new THREE.BufferAttribute(movement, 1));

  // Reference: https://threejs.org/docs/?q=points#api/en/objects/Points

  const mistMesh = new THREE.Points(mistGeometry, mistMaterial);

  mistMesh.receiveShadow = true;
  mistMesh.castShadow = true;

  scene.add(mistMesh);

  function updateMist(time) {
    const coordinates = mistMesh.geometry.attributes.position.array;
    const movement = mistMesh.geometry.attributes.movement.array;

    for (let i = 0; i < mistCount; i++) {
      coordinates[i * 3] += Math.sin(time + i) * movement[i];
      coordinates[i * 3 + 2] += Math.cos(time + i) * movement[i];
    }

    mistMesh.geometry.attributes.position.needsUpdate = true;
  }

  // Grass
  // Reference: https://github.com/James-Smyth/three-grass-demo/blob/main/src/index.js

  const grassCount = 10000;
  const grassRadius = Math.random() * (0.025 - 0.005) + 0.005;
  const grassHeight = 2;
  const patchCount = 50;
  const patchRadius = 5;
  const amplitude = Math.random() * (0.5 - 0.1) + 0.1;
  const speed = Math.random() * (0.9 - 0.5) + 0.5;

  let timer = 0;

  function createBlade() {
    const bladeHeight = grassHeight + Math.random() * 2;

    // Reference: https://threejs.org/docs/?q=cone#api/en/geometries/ConeGeometry

    const grassGeometry = new THREE.ConeGeometry(grassRadius, bladeHeight, 8);

    return new THREE.Mesh(grassGeometry, grassMaterial);
  }

  const grassMesh = new THREE.Group();

  function createGrass() {
    for (let i = 0; i < grassCount / 2; i++) {
      const blade = createBlade();
      const x = Math.random() * 50 - 50 / 2;
      const z = Math.random() * 50 - 50 / 2;
      blade.position.set(x, 0, z);
      blade.rotation.z = Math.random() * 0.1;
      blade.rotation.x = Math.random() * 0.1;
      blade.originalPosition = blade.position.clone();
      blade.receiveShadow = true;
      blade.castShadow = true;
      const coordinates = new THREE.Vector3(
        blade.position.x,
        blade.position.y,
        blade.position.z
      );
      if (!checkCoordinates(coordinates, camera, 6.5)) {
        grassMesh.add(blade);
      }
    }

    for (let i = 0; i < patchCount; i++) {
      const patchX = Math.random() * 50 - 50 / 2;
      const patchZ = Math.random() * 50 - 50 / 2;
      for (let j = 0; j < grassCount / 2 / patchCount; j++) {
        const blade = createBlade();
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * patchRadius;
        const x = patchX + distance * Math.cos(angle);
        const z = patchZ + distance * Math.sin(angle);
        blade.position.set(x, -1, z);
        blade.originalPosition = blade.position.clone();
        blade.rotation.z = Math.random() * 0.1;
        blade.rotation.x = Math.random() * 0.1;
        const coordinates = new THREE.Vector3(
          blade.position.x,
          blade.position.y,
          blade.position.z
        );
        if (!checkCoordinates(coordinates, camera, 6.5)) {
          grassMesh.add(blade);
        }
      }
    }
    grassMesh.receiveShadow = true;
    grassMesh.castShadow = true;
    scene.add(grassMesh);
  }

  createGrass();

  function updateGrass(time) {
    timer += speed;
    grassMesh.children.forEach((blade) => {
      const oscillation = amplitude * Math.sin(time);
      blade.position.y = blade.originalPosition.y + oscillation;
    });
  }

  // Birds

  let birds = [];
  let birdVelocities = [];

  function createBird() {
    const birdShape = new THREE.Shape();
    birdShape.moveTo(0, 0);
    birdShape.quadraticCurveTo(2, 4, 6, 0);
    birdShape.quadraticCurveTo(2, 3, 0, 0);
    const birdGeometry = new THREE.ShapeGeometry(birdShape);
    const birdMesh = new THREE.Mesh(birdGeometry, birdMaterial);
    birdMesh.receiveShadow = true;
    birdMesh.castShadow = true;
    const birdVelocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.05,
      -Math.random() * 0.02,
      (Math.random() - 0.5) * 0.05
    );
    birds.push(birdMesh);
    birdVelocities.push(birdVelocity);
    return birdMesh;
  }

  for (let i = 0; i < 5; i++) {
    const birdMesh = createBird();
    birdMesh.position.set(
      Math.random() * -50 - 50,
      Math.random() * 25 + 35,
      Math.random() * -50 - 50
    );
    scene.add(birdMesh);
  }

  function updateBirds() {
    const biasedBoolean = Math.random() > 0.75;
    if (biasedBoolean) {
      const randomBird = birds[Math.floor(Math.random() * birds.length)];
      randomBird.rotation.x += Math.PI;
    }
    birds.forEach((bird, index) => {
      const birdVelocity = birdVelocities[index];
      bird.position.add(birdVelocity);
      if (bird.position.x < -100) bird.position.x = 100;
    });
  }

  // Background

  const backgroundGeometry = new THREE.SphereGeometry(200, 32, 32);
  const backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
  scene.add(backgroundMesh);

  // Haze

  const hazeGeometry = new THREE.SphereGeometry(100, 32, 32);
  const hazeMesh = new THREE.Mesh(hazeGeometry, hazeMaterial);
  scene.add(hazeMesh);

  // Audio
  // Reference: https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor

  navigator.mediaDevices.getUserMedia({ audio: true }).then(async (stream) => {
    let randomIndex = Math.floor(Math.random() * leaves.length);
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    await audioContext.audioWorklet.addModule('audio.js');
    const audioProcessorNode = new AudioWorkletNode(
      audioContext,
      'audio-processor'
    );
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(analyser);
    analyser.connect(audioProcessorNode);
    audioProcessorNode.connect(audioContext.destination);
    audioProcessorNode.port.onmessage = function (event) {
      const { average } = event.data;
      if (average * 100 > 1) {
        if (startTrunks) {
          growTrunks();
        } else if (startBranches) {
          growBranches();
        } else if (!startLeaves && leavesComplete && leaves.length) {
          startLeaves = true;
        }
      }
      if (startLeaves) {
        const leafVelocity = leafVelocities[randomIndex];
        leaves[randomIndex].position.add(leafVelocity);
        leafVelocity.y -= 0.001;
        leafVelocity.x += Math.random() * 0.000001;
        leafVelocity.z += Math.random() * 0.000001;
        if (leaves[randomIndex].position.y < -1) {
          scene.remove(leaves[randomIndex]);
          leaves.splice(randomIndex, 1);
          leafVelocities.splice(randomIndex, 1);
          randomIndex = Math.floor(Math.random() * leaves.length);
          startLeaves = false;
        }
      }
    };
  });

  // Animation

  function animate() {
    const time = clock.getElapsedTime();
    requestAnimationFrame(animate);
    updateBirds();
    updateMoon();
    updateLight();
    updatePond();
    updateBranches();
    updateMist(time);
    updateGrass(time);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}

main();