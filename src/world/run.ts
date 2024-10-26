import * as THREE from "three";
import { SceneInit } from "../lib/SceneManager";
import { OrbitControls } from "three/examples/jsm/Addons.js";

import Boid0 from "../agents/Boid0";
import { boidParamsType } from "../agents/Boid0";

const quantity = 100;

export const boundingDim = new THREE.Vector3(200, 120, 140);

export default function run(canvas: HTMLCanvasElement) {
  // initilizing the world
  const world = new SceneInit(canvas);
  world.cam.position.set(0, 0, boundingDim.z / 2 + 80);

  // creating an object
  const outerBoundary = 7;
  const boundingGeo = new THREE.BoxGeometry(
    boundingDim.x + outerBoundary,
    boundingDim.y + outerBoundary,
    boundingDim.z + outerBoundary
  );
  const boundingEdges = new THREE.EdgesGeometry(boundingGeo);
  const boundingBox = new THREE.LineSegments(
    boundingEdges,
    new THREE.LineBasicMaterial({ color: 0x888800 })
  );
  world.scene.add(boundingBox);

  // params & gui
  const boidParams: boidParamsType = {
    turnaroundFactor: 0.03,

    separationRange: 8,
    separationFactor: 0.5,

    alignmentRange: 16,
    alignmentFactor: 0.5,

    cohesionRange: 12,
    cohesionFactor: 0.5,
  };

  world.gui.add(boidParams, "turnaroundFactor", 0, 5, 0.01);

  world.gui.add(boidParams, "separationRange", 0, 100, 0.1);
  world.gui.add(boidParams, "alignmentRange", 0, 100, 0.1);
  world.gui.add(boidParams, "cohesionRange", 0, 100, 0.1);

  world.gui.add(boidParams, "separationFactor", 0, 5, 0.01);
  world.gui.add(boidParams, "alignmentFactor", 0, 5, 0.01);
  world.gui.add(boidParams, "cohesionFactor", 0, 5, 0.01);

  // boid one
  const normalMat = new THREE.MeshNormalMaterial();
  const agentGeo = new THREE.ConeGeometry(2, 5);
  agentGeo.rotateX(Math.PI * -0.5);

  const boids: Boid0[] = [];

  // create multiple boids
  for (let i = 0; i < quantity; i++) {
    const agent0 = new Boid0(agentGeo, normalMat);
    boids.push(agent0);
    world.scene.add(agent0.mesh);
  }

  // orb ctrls
  const orbctrls = new OrbitControls(world.cam, canvas);

  // animate loop
  function animate() {
    orbctrls.update();

    world.statsPanel.update();
    world.resizeCanvas(); // resize the canvas if needed
    world.render();

    // update calls
    for (let i = 0; i < quantity; i++) {
      boids[i].move(boidParams);
    }

    window.requestAnimationFrame(animate);
  }

  animate();

  return world;
}
