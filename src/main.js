import './style.css'

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { distance } from 'three/tsl';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none'; // allows interaction with main canvas
document.body.appendChild(labelRenderer.domElement);

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight,ambientLight);

const controls = new OrbitControls(camera, renderer.domElement);

function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));

  star.position.set(x, y, z);
  scene.add(star);
}

Array(200).fill().forEach(addStar);

const spaceTexture = new THREE.TextureLoader().load('space.png');
scene.background = spaceTexture;

const sunTexture = new THREE.TextureLoader().load('sun.jpg');
const normalTexture = new THREE.TextureLoader().load('sunnormal.jpg');
const sun = new THREE.Mesh( 
  new THREE.SphereGeometry(5, 32, 32),
  new THREE.MeshStandardMaterial({ 
    map: sunTexture,
    normalMap: normalTexture,
    emissive: 0xffaa00,
    emissiveIntensity: 2})
);
scene.add(sun);

const spriteMaterial = new THREE.SpriteMaterial({
  map: new THREE.TextureLoader().load('glow.png'),
  color: 0xffa500,
  transparent: true,
  blending: THREE.AdditiveBlending
});

const glow = new THREE.Sprite(spriteMaterial);
glow.scale.set(15, 15, 1); // bigger than sun
sun.add(glow);
const textureLoader = new THREE.TextureLoader();

function createOrbitingPlanet(textureFile, size, distance, speed, revolutionSpeed, name) {
  const pivot = new THREE.Object3D();
  scene.add(pivot);

  const texture = textureLoader.load(textureFile);
  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(size, 32, 32),
    new THREE.MeshStandardMaterial({ map: texture })
  );
  
  planet.position.set(distance, 0, 0); 
  pivot.add(planet);

  const div = document.createElement('div');
  div.className = 'label';
  div.textContent = name,
  div.style.color = 'white';
  div.style.fontSize = '14px';
  div.style.fontFamily =  'sans-serif';
  const label = new CSS2DObject(div);
  label.position.set(0, size + 0.5, 0);
  planet.add(label);

  return { pivot, planet, speed, revolutionSpeed };
}

const mercury = createOrbitingPlanet('mercury1.jpg', 0.5, 6, 0.01, 0.02,'Mercury');
const venus   = createOrbitingPlanet('venus.jpg',   0.9, 9,  0.008, 0.015,'Venus');
const earth   = createOrbitingPlanet('earth.jpg',   1,   12, 0.01,  0.01, 'Earth');
const mars    = createOrbitingPlanet('mars.jpg',    0.7, 15, 0.009, 0.008, 'Mars');
const jupiter = createOrbitingPlanet('jupiter.jpg', 2.5, 20, 0.006, 0.007, 'Jupiter');
const saturn  = createOrbitingPlanet('saturn.jpg',  2,   27, 0.005, 0.006, 'Saturn');
const ringGeometry = new THREE.RingGeometry(2.5, 4.5, 64);
const ringMaterial = new THREE.MeshBasicMaterial({
  color: 0xaaaaaa,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 2
});
const rings = new THREE.Mesh(ringGeometry, ringMaterial);

// tilt rings slightly
rings.rotation.x = Math.PI / 2.5;
rings.renderOrder = 1; // keeps it visible without weird clipping

// attach rings to Saturn so they move together
saturn.planet.add(rings);
const uranus  = createOrbitingPlanet('uranus.jpg',  1.5, 33, 0.004, 0.004, 'Uranus');
const neptune = createOrbitingPlanet('neptune.jpg', 1.5, 39, 0.003, 0.003, 'Neptune');

function animate() {
  requestAnimationFrame(animate); 
  sun.rotation.y += 0.005;
  mercury.planet.rotation.y += mercury.speed;
  venus.planet.rotation.y += venus.speed;
  earth.planet.rotation.y += earth.speed;
  mars.planet.rotation.y += mars.speed;
  jupiter.planet.rotation.y += jupiter.speed;
  saturn.planet.rotation.y += saturn.speed;
  uranus.planet.rotation.y += uranus.speed;
  neptune.planet.rotation.y += neptune.speed;
 
  mercury.pivot.rotation.y += mercury.revolutionSpeed;
  venus.pivot.rotation.y   += venus.revolutionSpeed;
  earth.pivot.rotation.y   += earth.revolutionSpeed;
  mars.pivot.rotation.y    += mars.revolutionSpeed;
  jupiter.pivot.rotation.y += jupiter.revolutionSpeed;
  saturn.pivot.rotation.y  += saturn.revolutionSpeed;
  uranus.pivot.rotation.y  += uranus.revolutionSpeed;
  neptune.pivot.rotation.y += neptune.revolutionSpeed;
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}
animate();