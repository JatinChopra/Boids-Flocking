import * as THREE from "three";
import { getRandomVector } from "../lib/utils";
import { boundingDim } from "../world/run";
import Boid0 from "./Boid";

import { GLTFLoader } from "three/examples/jsm/Addons.js";

import Projectile from "./Projectile";

const clock = new THREE.Clock();
let oldtime = clock.getElapsedTime();

export type predatorParamsType = {
  maxSpeed: number;
  chasingRange: number;
  chasingFactor: number;
};

export default class Predator {
  idx: number;
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  flock: Boid0[];
  mag: Projectile[];
  rotationMatrix: THREE.Matrix4;
  targetQuaternion: THREE.Quaternion;
  mainProjectileArr: Projectile[];
  scene: THREE.Scene;

  constructor(
    idx: number,
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    flock: Boid0[],
    mainProjectileArr: Projectile[],
    scene: THREE.Scene
  ) {
    this.scene = scene;
    this.idx = idx;

    this.mesh = new THREE.Mesh(geo, mat);

    // this.mesh.position.z = 100;
    this.velocity = getRandomVector();
    this.velocity.z = 0;
    this.flock = flock;
    this.rotationMatrix = new THREE.Matrix4();
    this.targetQuaternion = new THREE.Quaternion();
    this.mag = this.createProjectiles(100);
    this.mainProjectileArr = mainProjectileArr;
  }

  createProjectiles(num: 100): Projectile[] {
    const list: Projectile[] = [];
    for (let i = 0; i < num; i++) {
      const newProjectile = new Projectile(this, this.scene);
      list.push(newProjectile);
    }
    return list;
  }

  move(params: predatorParamsType) {
    const chase = this.chase(params);

    chase && this.velocity.add(chase);
    this.makeRotation();

    this.mesh.position.add(this.velocity);
    this.stayInsideBoundary(0.04);
  }

  makeRotation() {
    this.rotationMatrix.lookAt(
      this.mesh.position,
      this.mesh.position.clone().add(this.velocity),
      this.mesh.up
    );

    this.targetQuaternion.setFromRotationMatrix(this.rotationMatrix);

    this.mesh.quaternion.rotateTowards(this.targetQuaternion, 0.1);
  }

  chase(params: predatorParamsType) {
    let nearestBoidIdx = 0;
    let minDistance = this.mesh.position.distanceTo(
      this.flock[nearestBoidIdx].mesh.position
    );

    for (let i = 0; i < this.flock.length; i++) {
      const prey = this.flock[i];
      const distance = this.mesh.position.distanceTo(prey.mesh.position);

      if (distance < params.chasingRange && distance < minDistance) {
        nearestBoidIdx = i;
        minDistance = distance;
      }
    }

    const target = this.flock[nearestBoidIdx];

    const desiredVector = new THREE.Vector3().subVectors(
      target.mesh.position,
      this.mesh.position
    );

    const norm = minDistance / params.chasingRange;

    desiredVector.normalize().multiplyScalar(params.maxSpeed);

    const steer = desiredVector.sub(this.velocity);
    steer.multiplyScalar(params.chasingFactor);

    // if target in hunting range then shoot projectiles
    const currentTime = clock.getElapsedTime();
    const delta = currentTime - oldtime;
    if (minDistance < 20 && this.mag.length > 0 && delta > 2) {
      //   // then shoot
      oldtime = currentTime;
      const projectile = this.mag.pop() as Projectile;
      projectile?.setTarget(target);
      projectile.mesh.position.copy(this.mesh.position.clone());
      this.mainProjectileArr.push(projectile);
      this.scene.add(projectile.mesh);
    }

    return steer;
  }

  stayInsideBoundary(turnaroundFactor: number) {
    const innerBoundary = 4;

    for (let axis = 0; axis < 3; axis++) {
      const pos = this.mesh.position.getComponent(axis);

      const bounds = boundingDim.getComponent(axis) / 2 - innerBoundary;

      if (pos > bounds) {
        this.velocity.setComponent(
          axis,
          this.velocity.getComponent(axis) - turnaroundFactor
        );
      }

      if (pos < -bounds) {
        this.velocity.setComponent(
          axis,
          this.velocity.getComponent(axis) + turnaroundFactor
        );
      }
    }
  }
}
