import * as THREE from "three";
import { getRandomVector } from "../lib/utils";
import { boundingDim } from "../world/run";
import Boid from "./Boid";

import Projectile from "./Projectile";
import TrailParticle from "../particles/TrailParticle";

export type predatorParamsType = {
  quantity: number;
  maxSpeed: number;
  chasingRange: number;
  chasingFactor: number;
};

export default class Predator {
  idx: number;
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  flock: Boid[];
  mag: Projectile[];
  rotationMatrix: THREE.Matrix4;
  targetQuaternion: THREE.Quaternion;
  mainProjectileArr: Projectile[];
  scene: THREE.Scene;
  particles: TrailParticle[];

  private lastProjectileTime: number = 0;
  private static clock: THREE.Clock = new THREE.Clock(); // Make clock static and shared

  constructor(
    idx: number,
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    flock: Boid[],
    mainProjectileArr: Projectile[],
    scene: THREE.Scene
  ) {
    this.scene = scene;
    this.idx = idx;
    this.particles = [];

    this.mesh = new THREE.Mesh(geo, mat);

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
    for (let particle of this.particles) {
      if (!this.scene.children.includes(particle.mesh)) {
        // remove this from array
        const idx = this.particles.indexOf(particle);
        this.particles.splice(idx, 1);
      }
      particle.animate();
    }

    // if (currentTime - this.lastParticleTime > particle_delay) {
    const offset = this.velocity
      .clone()
      .normalize()
      .negate()
      .multiplyScalar(2.5);

    const particle = new TrailParticle(
      this.scene,
      this.mesh.position.clone().add(offset),
      2,
      0,
      5
    );
    this.particles.push(particle);

    // }

    const chase = this.chase(params);

    chase && this.velocity.add(chase);
    this.makeRotation();

    this.mesh.position.add(this.velocity);
    // this.stayInsideBoundary(0.04);
    this.stayInsideBox(0.02);
    this.stayAbovePlane();
  }

  separation() {}

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
    if (this.flock.length == 0) return;
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

    desiredVector.normalize().multiplyScalar(params.maxSpeed);

    const steer = desiredVector.sub(this.velocity);
    steer.multiplyScalar(params.chasingFactor);

    // if target in hunting range then shoot projectiles
    const currentTime = Predator.clock.getElapsedTime();
    const shootdelay = Math.random() * 5 + 3;
    const delta = currentTime - this.lastProjectileTime;
    if (minDistance < 30 && this.mag.length > 0 && delta > shootdelay) {
      //   // then shoot
      this.lastProjectileTime = currentTime;
      const projectile = this.mag.pop() as Projectile;
      projectile?.setTarget(target);

      // offsetDirection
      const offset = new THREE.Vector3()
        .copy(this.velocity)
        .normalize()
        .multiplyScalar(5);

      projectile.mesh.position.copy(this.mesh.position.clone().add(offset));
      this.mainProjectileArr.push(projectile);

      this.scene.add(projectile.mesh);

      const audio = new Audio();
      audio.volume = 0.5;
      audio.src = "./laserShoot.wav";
      audio.play();
    }

    return steer;
  }

  stayInsideBoundary(turnaroundFactor: number) {
    const innerBoundary = 4;

    for (let axis = 0; axis < 3; axis++) {
      const pos = this.mesh.position.getComponent(axis);

      let bounds = boundingDim.getComponent(axis) / 2 - innerBoundary;

      if (pos > bounds) {
        if (axis == 1) {
          bounds = boundingDim.getComponent(axis) - innerBoundary;
        }
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
  stayAbovePlane() {
    if (this.mesh.position.y < 5) {
      this.velocity.setComponent(1, this.velocity.getComponent(1) + 0.2);
    }
  }

  stayInsideBox(turnaroundFactor: number) {
    for (let axis = 0; axis < 3; axis++) {
      let bound = boundingDim.getComponent(axis) / 2;

      const poscomponent = this.mesh.position.getComponent(axis);

      if (axis == 1 && poscomponent > boundingDim.getComponent(axis)) {
        this.velocity.setComponent(
          axis,
          this.velocity.getComponent(axis) - turnaroundFactor
        );
      }

      if (poscomponent > bound && axis != 1) {
        this.velocity.setComponent(
          axis,
          this.velocity.getComponent(axis) - turnaroundFactor
        );
      }

      if (poscomponent < -bound && axis != 1) {
        if (axis != 1)
          this.velocity.setComponent(
            axis,
            this.velocity.getComponent(axis) + turnaroundFactor
          );
      }
    }
  }
}
