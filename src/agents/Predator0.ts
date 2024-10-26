import * as THREE from "three";
import { getRandomVector } from "../lib/utils";
import { boundingDim } from "../world/run";
import Boid0 from "./Boid0";

export type predatorParamsType = {
  chasingRange: number;
  chasingFactor: number;
};

export default class Predator0 {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  flock: Boid0[];
  rotationMatrix: THREE.Matrix4;
  targetQuaternion: THREE.Quaternion;

  constructor(geo: THREE.BufferGeometry, mat: THREE.Material, flock: Boid0[]) {
    this.mesh = new THREE.Mesh(geo, mat);

    // this.mesh.position.z = 100;
    this.velocity = getRandomVector();
    this.velocity.z = 0;
    this.flock = flock;
    this.rotationMatrix = new THREE.Matrix4();
    this.targetQuaternion = new THREE.Quaternion();
  }

  move(params: predatorParamsType) {
    const chase = this.chase(params);

    chase && this.velocity.add(chase);
    this.makeRotation();

    this.mesh.position.add(this.velocity);
    this.stayInsideBoundary(0.01);
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
    for (let i = 0; i < 3; i++) {
      const bound = boundingDim.getComponent(i) / 2 + 10;
      if (
        this.mesh.position.getComponent(i) > bound ||
        this.mesh.position.getComponent(i) < -bound
      ) {
        return;
      }
    }

    const chasingRange = params.chasingRange;
    const chasingFactor = params.chasingFactor;

    let nearestBoidIdx = 0;
    let minDistance = this.mesh.position.distanceTo(
      this.flock[nearestBoidIdx].mesh.position
    );

    for (let i = 0; i < this.flock.length; i++) {
      const prey = this.flock[i];
      const distance = this.mesh.position.distanceTo(prey.mesh.position);

      if (distance < chasingRange && distance < minDistance) {
        nearestBoidIdx = i;
        minDistance = distance;
      }
    }

    const target = this.flock[nearestBoidIdx];

    const desiredVector = new THREE.Vector3().subVectors(
      target.mesh.position,
      this.mesh.position
    );
    desiredVector.normalize().multiplyScalar(1.2);

    const steer = desiredVector.sub(this.velocity);
    steer.multiplyScalar(0.03);

    return steer;
  }

  stayInsideBoundary(turnaroundFactor: number) {
    const innerBoundary = 7;

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
