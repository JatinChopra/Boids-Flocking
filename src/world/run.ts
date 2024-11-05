import * as THREE from "three";
import { SceneInit } from "../lib/SceneManager";

import BoidsManager from "../agentManager/Boidsmanager";
import { boidParamsType } from "../agents/Boid";
import { predatorParamsType } from "../agents/Predator";

export const boundingDim = new THREE.Vector3(200, 120, 140);

export type repulsionSphere = {
  radius: number;
  mesh: THREE.Mesh;
};

export default function run(canvas: HTMLCanvasElement) {
  // initilizing the world
  const world = new SceneInit(canvas);
  world.scene.background = new THREE.Color(0x151515);

  world.cam.position.set(200, 200, 200);
  world.cam.lookAt(0, 0, 0);

  // lighting
  const ambient = new THREE.AmbientLight(0xffffff, 1);
  const pointLight = new THREE.PointLight(0xffffff, 200000);
  pointLight.shadow.mapSize.width = 2048;
  pointLight.shadow.mapSize.height = 2048;
  pointLight.castShadow = true;
  const pointLightHelper = new THREE.PointLightHelper(pointLight);
  pointLightHelper.color = new THREE.Color(0xffff00);
  pointLight.position.set(100, 180, 0);

  world.scene.add(ambient);
  world.scene.add(pointLightHelper);
  world.scene.add(pointLight);

  const bottomPlaneGeo = new THREE.PlaneGeometry(550, 550);
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
  const boidParams: boidParamsType = {
    z_movement: true,
    boundary: false,
    turnaroundFactor: 0.08,

    separationRange: 8,
    separationFactor: 0.5,

    alignmentRange: 20,
    alignmentFactor: 0.03,

    cohesionRange: 16,
    cohesionFactor: 0.02,

    escapeRange: 18,
    escapeFactor: 99,
  };

  const predatorParams: predatorParamsType = {
    quantity: 1,
    maxSpeed: 3.5,
    chasingRange: 30,
    chasingFactor: 0.02,
  };

  const boundingEdges = new THREE.EdgesGeometry(boundingGeo);
  const boundingMat = new THREE.LineBasicMaterial({
    color: 0x888800,
    visible: false,
  });
  boundingEdges.translate(0, boundingDim.getComponent(1) / 2, 0);
  const boundingBox = new THREE.LineSegments(boundingEdges, boundingMat);
  world.scene.add(boundingBox);

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

  world.gui.close();

  // // grid helper
  const size = 550;
  const divisions = 50;

  const gridHelper = new THREE.GridHelper(size, divisions, 0x000000, 0x000000);
  gridHelper.position.set(0, 1, 0);
  world.scene.add(gridHelper);
  const repulsionPoints: repulsionSphere[] = [];

  // const torusGroup = new THREE.Group();
  // function generateTorusSpheres(
  //   torusRadius: number,
  //   sphereSize: number,
  //   side: "xy" | "yz" | "xz",
  //   group: THREE.Group,
  //   h: number
  // ) {
  //   for (let i = 0; i < Math.PI * 2; i += Math.PI / 4) {
  //     const repulsionSphere = new THREE.Mesh(
  //       new THREE.SphereGeometry(sphereSize),
  //       new THREE.MeshBasicMaterial({
  //         color: 0xffffff,
  //         wireframe: true,
  //       })
  //     );
  //     group.add(repulsionSphere);

  //     const x = torusRadius * Math.cos(i);
  //     const y = torusRadius * Math.sin(i);

  //     const repulsionObj = {
  //       mesh: repulsionSphere,
  //       radius: sphereSize + 2,
  //     };

  //     repulsionPoints.push(repulsionObj);

  //     if (side == "xy") repulsionSphere.position.set(x, y, 0);

  //     if (side == "yz") repulsionSphere.position.set(0, y, x);

  //     if (side == "xz") repulsionSphere.position.set(x, 0, y);
  //   }
  // }

  // const torus = new THREE.Mesh(
  //   new THREE.TorusGeometry(20, 8),
  //   new THREE.MeshBasicMaterial({ color: 0x22222 })
  // );
  // torus.castShadow = true;

  // torus.position.set(0, 50, 0);
  // world.scene.add(torus);

  // generateTorusSpheres(20, 8, "xy", torusGroup, 50);
  // torusGroup.position.set(0, 50, 0);
  // world.scene.add(torusGroup);

  // const newgroup = new THREE.Group();

  // generateTorusSpheres(20, 8, "xy", newgroup, 50);
  // newgroup.rotateZ(Math.PI * 0.4);

  // newgroup.position.set(0, 50, 0);
  // world.scene.add(newgroup);

  // const repulsionSphereOne = new THREE.Mesh(
  //   new THREE.SphereGeometry(8),
  //   new THREE.MeshBasicMaterial({ wireframe: true })
  // );
  // repulsionSphereOne.position.set(0, 50, 0);
  // world.scene.add(repulsionSphereOne);

  // const pointOne: repulsionSphere = {
  //   radius: 8 + 2,
  //   mesh: repulsionSphereOne,
  // };

  // repulsionPoints.push(pointOne);

  // const repulsionSphereTwo = new THREE.Mesh(
  //   new THREE.SphereGeometry(8),
  //   new THREE.MeshBasicMaterial({ wireframe: true })
  // );
  // repulsionSphereTwo.position.set(50, 50, 0);
  // world.scene.add(repulsionSphereTwo);

  // const pointTwo: repulsionSphere = {
  //   radius: 8 + 2,
  //   mesh: repulsionSphereTwo,
  // };
  // repulsionSphereTwo.castShadow = true;

  // repulsionPoints.push(pointTwo);

  // boid one
  const geo0 = new THREE.ConeGeometry(1.5, 5, 4);
  geo0.rotateX(Math.PI * -0.5);
  const mat0 = new THREE.MeshStandardMaterial({ color: 0xfc03ba });

  const group0 = new BoidsManager(
    world.scene,
    140,
    boidParams,
    predatorParams,
    repulsionPoints,
    geo0,
    mat0,
    // boundingDim,
    new THREE.Vector3(120, 0, 0),
    "dome",
    40
  );

  const geo1 = new THREE.ConeGeometry(1.0, 4, 4);
  geo1.rotateX(Math.PI * -0.5);
  const mat1 = new THREE.MeshStandardMaterial({ color: 0xff9d00 });

  const group1 = new BoidsManager(
    world.scene,
    120,
    boidParams,
    predatorParams,
    repulsionPoints,
    geo1,
    mat1,
    // boundingDim,
    new THREE.Vector3(80, 0, 0),
    "dome",
    30
  );

  const geo2 = new THREE.ConeGeometry(1.0, 4, 4);
  geo2.rotateX(Math.PI * -0.5);
  const mat2 = new THREE.MeshStandardMaterial({ color: 0x00ffc8 });

  const group2 = new BoidsManager(
    world.scene,
    220,
    boidParams,
    predatorParams,
    repulsionPoints,
    geo2,
    mat2,
    boundingDim,
    "box"
  );

  // group0.createPredator(1);
  group2.createPredator(1);
  group1.assignPredator(group2.predators[0]);
  group0.assignPredator(group2.predators[0]);

  // orb ctrls
  // const orbctrls = new OrbitControls(world.cam, canvas);

  // function torusAnimate() {
  //   torusGroup.rotation.x += 0.01;
  //   torusGroup.rotation.y += 0.01;

  //   // newgroup.rotation.x += 0.01;
  //   // newgroup.rotation.y += 0.01;

  //   torus.rotation.x += 0.01;
  //   torus.rotation.y += 0.01;
  // }

  // animate loop

  const followCam = world.cam;

  const predator = group2.predators[0];

  function followCamera() {
    // predator pos
    const predatorPosition = predator.mesh.position;
    const predatorDirection = predator.mesh.getWorldDirection(
      new THREE.Vector3()
    );

    // ideal camera pos
    // const idealOffset = new THREE.Vector3(1.0, 0.5, 5.5);
    const idealOffset = new THREE.Vector3(60.0, 80.5, 85.5);
    idealOffset.applyQuaternion(predator.mesh.quaternion);
    const idealPosition = predatorPosition.clone().add(idealOffset);

    const t = 0.025; //  control smoothing (lower = smoother)
    followCam.position.lerp(idealPosition, t);

    // (slightly ahead of predator)
    const lookAheadDistance = 1.8;
    const idealLookAt = predatorPosition
      .clone()
      .add(predatorDirection.multiplyScalar(lookAheadDistance));

    // temporary vector for current camera look-at
    const currentLookAt = new THREE.Vector3();
    followCam.getWorldDirection(currentLookAt);
    currentLookAt.multiplyScalar(lookAheadDistance).add(followCam.position);

    // smoothly interpolate look-at point
    const smoothLookAt = currentLookAt.clone().lerp(idealLookAt, t);

    // apply smoothed look-at
    followCam.lookAt(smoothLookAt);

    // damping ==> rotation
    const currentRotation = followCam.quaternion.clone();
    const targetRotation = new THREE.Quaternion();
    followCam.lookAt(idealLookAt);
    targetRotation.copy(followCam.quaternion);
    followCam.quaternion.copy(currentRotation);
    followCam.quaternion.slerp(targetRotation, t);
  }

  function animate() {
    // orbctrls.update();

    world.statsPanel.update();
    world.resizeCanvas(); // resize the canvas if needed
    world.render();

    // update torus sphere
    // torusAnimate();

    // update calls
    group0.updateFlockPosition();
    group0.updatePredators();
    group0.updateProjectiles();
    group0.updateExplosionParticle();

    group1.updateFlockPosition();
    group1.updatePredators();
    group1.updateProjectiles();
    group1.updateExplosionParticle();

    group2.updateFlockPosition();
    group2.updatePredators();
    group2.updateProjectiles();
    group2.updateExplosionParticle();

    followCamera();

    window.requestAnimationFrame(animate);
  }

  animate();

  return world;
}
