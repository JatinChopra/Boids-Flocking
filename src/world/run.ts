import * as THREE from "three";
import { SceneInit } from "../lib/SceneManager";
import { GLTFLoader, OrbitControls } from "three/examples/jsm/Addons.js";

import BoidsManager from "../agentManager/Boidsmanager";
import { boidParamsType } from "../agents/Boid";
import { predatorParamsType } from "../agents/Predator";

const quantity = 10;

export const boundingDim = new THREE.Vector3(200, 120, 140);

export default function run(canvas: HTMLCanvasElement) {
  // initilizing the world
  const world = new SceneInit(canvas);
  // world.scene.background = new THREE.Color(0x1b1b1b);
  world.scene.background = new THREE.Color(0x151515);
  // world.cam.position.set(0, 0, boundingDim.z / 2 + 80);
  world.cam.position.set(0, 0, 200);

  // creating an object
  const outerBoundary = 7;
  const boundingGeo = new THREE.BoxGeometry(
    boundingDim.x + outerBoundary,
    boundingDim.y + outerBoundary,
    boundingDim.z + outerBoundary
  );

  const boundingEdges = new THREE.EdgesGeometry(boundingGeo);
  boundingEdges.translate(0, boundingDim.getComponent(1) / 2, 0);
  const boundingBox = new THREE.LineSegments(
    boundingEdges,
    new THREE.LineBasicMaterial({ color: 0x888800 })
  );
  // world.scene.add(boundingBox);

  // params & gui
  const boidParams: boidParamsType = {
    boundary: false,
    turnaroundFactor: 0.08,

    separationRange: 8,
    separationFactor: 0.5,

    alignmentRange: 16,
    alignmentFactor: 0.03,

    cohesionRange: 12,
    cohesionFactor: 0.02,

    escapeRange: 18,
    escapeFactor: 99,
  };

  const predatorParams: predatorParamsType = {
    maxSpeed: 1.4,
    chasingRange: 30,
    chasingFactor: 0.02,
  };

  const boidFolder = world.gui.addFolder("Boid");
  boidFolder.add(boidParams, "turnaroundFactor", 0, 5, 0.01);
  boidFolder.add(boidParams, "boundary");

  boidFolder.add(boidParams, "separationRange", 0, 100, 0.1);
  boidFolder.add(boidParams, "alignmentRange", 0, 100, 0.1);
  boidFolder.add(boidParams, "cohesionRange", 0, 100, 0.1);
  boidFolder.add(boidParams, "escapeRange", 0, 100, 0.1);

  boidFolder.add(boidParams, "separationFactor", 0, 5, 0.01);
  boidFolder.add(boidParams, "alignmentFactor", 0, 5, 0.01);
  boidFolder.add(boidParams, "cohesionFactor", 0, 5, 0.01);
  boidFolder.add(boidParams, "escapeFactor", 0, 100, 1);

  const predatorFolder = world.gui.addFolder("Predator");
  predatorFolder.add(predatorParams, "maxSpeed", 0, 5, 0.1);
  predatorFolder.add(predatorParams, "chasingRange", 0, 100, 0.1);
  predatorFolder.add(predatorParams, "chasingFactor", 0, 5, 0.01);

  // dome
  const domegeo = new THREE.SphereGeometry(120);
  // domegeo.rotateX(Math.PI);
  const domeMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    wireframe: false,
    side: THREE.DoubleSide,
    // side: THREE.DoubleSide,
    // transparent: true,
    // opacity: 0.5,
  });

  const dome = new THREE.Mesh(domegeo, domeMat);

  // world.scene.add(dome);
  world.cam.position.set(60, 120, 150);

  // lighting
  const ambient = new THREE.AmbientLight(0xffffff, 1);
  const directional = new THREE.DirectionalLight(0xffffff, 1);
  directional.position.set(0, 100, -100);

  const pointLight = new THREE.PointLight(0xffffff, 100);
  pointLight.castShadow = true;
  const pointLightHelper = new THREE.PointLightHelper(pointLight);
  pointLightHelper.color = new THREE.Color(0xffff00);
  pointLight.position.set(0, 50, 0);

  world.scene.add(ambient);
  world.scene.add(pointLightHelper);
  world.scene.add(directional);
  world.scene.add(pointLight);

  // grid helper
  const size = 1250;
  const divisions = 50;

  const gridHelper = new THREE.GridHelper(size, divisions, 0x000000, 0x000000);
  world.scene.add(gridHelper);

  // boid one
  const group0 = new BoidsManager(
    world.scene,
    quantity,
    boidParams,
    predatorParams
  );
  group0.createPredator(2);

  // orb ctrls
  const orbctrls = new OrbitControls(world.cam, canvas);

  // animate loop
  function animate() {
    orbctrls.update();

    world.statsPanel.update();
    world.resizeCanvas(); // resize the canvas if needed
    world.render();

    // update calls
    group0.updateFlockPosition();
    group0.updatePredators();
    group0.updateProjectiles();
    group0.updateExplosionParticle();

    window.requestAnimationFrame(animate);
  }

  animate();

  return world;
}
