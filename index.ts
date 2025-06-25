import * as THREE from "three";
import { ArcballControls } from "three/addons/controls/ArcballControls";
import { World } from "./world";
import { attraction, repulsion } from "./layout";
import { config } from "./config";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  10000
);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const light = new THREE.AmbientLight(0x404040);
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff);
directionalLight.position.set(1, 1, 1);
directionalLight.lookAt(0, 0, 0);
scene.add(directionalLight);

camera.position.z = 40;

const controls = new ArcballControls(camera, renderer.domElement, scene);

const world = new World(10, 5);
world.addToScene(scene);

function updatePositions() {
  for (const [i, source] of world.sources.entries()) {
    const quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(
      source.axis,
      config.sourceSpeed * ((i + 1) / world.sources.length)
    );
    source.obj.position.applyQuaternion(quaternion);
  }

  for (let p of world.graph.uniquePoints()) {
    const force = new THREE.Vector3();

    for (let q of world.graph.uniquePoints()) {
      force.add(repulsion(p.pos, q.pos, config.repulsion));
    }
    for (const q of p.neighbors) {
      force.add(attraction(p.pos, q.pos, config.attraction));
    }
    for (const source of world.sources) {
      const q = source.obj.position;
      force.add(attraction(p.pos, q, config.sourceAttraction));
      force.add(repulsion(p.pos, q, config.sourceRepulsion));
    }
    if (force.length() > config.maxForce) {
      force.setLength(config.maxForce);
    }
    p.pos.add(force);
    world.update();
  }
}

function animate() {
  updatePositions();
  renderer.render(scene, camera);
  controls.update();
}
