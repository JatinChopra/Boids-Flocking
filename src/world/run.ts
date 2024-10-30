import * as THREE from "three";
import { SceneInit } from "../lib/SceneManager";
import { GLTFLoader, OrbitControls } from "three/examples/jsm/Addons.js";

import BoidsManager from "../agentManager/Boidsmanager";
import { boidParamsType } from "../agents/Boid";
import { predatorParamsType } from "../agents/Predator";
import { Group } from "three/examples/jsm/libs/tween.module.js";

const quantity = 180;

export const boundingDim = new THREE.Vector3(200, 120, 140);

export type repulsionSphere = {
  radius: number;
  mesh: THREE.Mesh;
};

export default function run(canvas: HTMLCanvasElement) {
  // initilizing the world
  const world = new SceneInit(canvas);
  // world.scene.background = new THREE.Color(0x1b1b1b);
  world.scene.background = new THREE.Color(0x151515);
  world.cam.position.set(0, boundingDim.y / 2, boundingDim.z / 2 + 80);
  // world.cam.position.set(0, , 150);

  const bottomPlaneGeo = new THREE.PlaneGeometry(1250, 1250);
  bottomPlaneGeo.rotateX(Math.PI * -0.5);
  const bottomPlaneMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
  const bottomPlane = new THREE.Mesh(bottomPlaneGeo, bottomPlaneMat);
  bottomPlane.receiveShadow = true;

  world.scene.add(bottomPlane);

  // creating an object
  const outerBoundary = 7;
  const boundingGeo = new THREE.BoxGeometry(
    boundingDim.x + outerBoundary,
    boundingDim.y + outerBoundary,
    boundingDim.z + outerBoundary
  );

  // params & gui

  const boundaryparam = {
    show: true,
  };

  const boidParams: boidParamsType = {
    z_movement: false,
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
    quantity: 1,
    maxSpeed: 1.75,
    chasingRange: 30,
    chasingFactor: 0.02,
  };

  const boundingEdges = new THREE.EdgesGeometry(boundingGeo);
  const boundingMat = new THREE.LineBasicMaterial({
    color: 0x888800,
  });
  boundingEdges.translate(0, boundingDim.getComponent(1) / 2, 0);
  const boundingBox = new THREE.LineSegments(boundingEdges, boundingMat);
  world.scene.add(boundingBox);

  const boundaryFolder = world.gui.addFolder("Boundary");
  boundaryFolder.add(boundaryparam, "show").onChange((value) => {
    boundingBox.visible = value;
  });

  const boidFolder = world.gui.addFolder("Boid");
  boidFolder.add(boidParams, "z_movement");
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
    color: 0x121212,
    wireframe: true,
    // side: THREE.DoubleSide,
    // transparent: true,
    // opacity: 0.3,
  });
  // domeMat.metalness = 1;
  // domeMat.roughness = 0.8;
  // domeMat.transmission = 1;
  // domeMat.roughness = 0;
  // domeMat.ior = 2.5;

  const dome = new THREE.Mesh(domegeo, domeMat);

  // world.scene.add(dome);

  // lighting
  const ambient = new THREE.AmbientLight(0xffffff, 1);
  const directional = new THREE.DirectionalLight(0xffffff, 1);
  directional.position.set(0, 100, -100);

  const pointLight = new THREE.PointLight(0xffffff, 100000);
  pointLight.castShadow = true;
  const pointLightHelper = new THREE.PointLightHelper(pointLight);
  pointLightHelper.color = new THREE.Color(0xffff00);
  pointLight.position.set(0, 180, 0);

  //Set up shadow properties for the light
  pointLight.shadow.mapSize.width = 512; // default
  pointLight.shadow.mapSize.height = 512; // default
  pointLight.shadow.camera.near = 0.5; // default
  pointLight.shadow.camera.far = 500; // default

  world.scene.add(ambient);
  world.scene.add(pointLightHelper);
  // world.scene.add(directional);
  world.scene.add(pointLight);
  // grid helper
  // const size = 1250;
  // const divisions = 50;

  // const gridHelper = new THREE.GridHelper(size, divisions, 0x000000, 0x000000);
  // world.scene.add(gridHelper);
  const repulsionPoints: repulsionSphere[] = [];

  const torusGroup = new THREE.Group();
  function generateTorusSpheres(
    torusRadius: number,
    sphereSize: number,
    side: "xy" | "yz" | "xz"
  ) {
    for (let i = 0; i < Math.PI * 2; i += Math.PI / 4) {
      const repulsionSphere = new THREE.Mesh(
        new THREE.SphereGeometry(sphereSize),
        new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
      );
      torusGroup.add(repulsionSphere);

      const x = torusRadius * Math.cos(i);
      const y = torusRadius * Math.sin(i);

      const repulsionObj = {
        mesh: repulsionSphere,
        radius: sphereSize,
      };

      repulsionPoints.push(repulsionObj);

      if (side == "xy") repulsionSphere.position.set(x, y, 0);

      if (side == "yz") repulsionSphere.position.set(0, y, x);

      if (side == "xz") repulsionSphere.position.set(x, 0, y);
    }
  }

  // generateTorusSpheres(25, 10, "yz");
  // torusGroup.position.set(0, 50, 0);
  // world.scene.add(torusGroup);

  // const repulsionSphereOne = new THREE.Mesh(
  //   new THREE.SphereGeometry(8),
  //   new THREE.MeshBasicMaterial({ wireframe: true })
  // );
  // repulsionSphereOne.position.set(0, 50, 0);
  // world.scene.add(repulsionSphereOne);

  // const pointOne: repulsionSphere = {
  //   radius: 8,
  //   mesh: repulsionSphereOne,
  // };

  // repulsionPoints.push(pointOne);

  // boid one
  const group0 = new BoidsManager(
    world.scene,
    quantity,
    boidParams,
    predatorParams,
    repulsionPoints
  );

  // group0.createPredator(1);

  // orb ctrls
  const orbctrls = new OrbitControls(world.cam, canvas);

  function torusAnimate() {
    torusGroup.rotation.y += 0.05;
    torusGroup.rotation.z += 0.05;
  }

  // animate loop
  function animate() {
    orbctrls.update();

    world.statsPanel.update();
    world.resizeCanvas(); // resize the canvas if needed
    world.render();

    // update torus sphere
    torusAnimate();

    // update calls
    group0.updateFlockPosition();
    group0.updatePredators();
    group0.updateProjectiles();
    group0.updateExplosionParticle();

    window.requestAnimationFrame(animate);
  }

  animate();

  return { world, group0 };
}
