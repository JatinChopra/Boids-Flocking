import * as THREE from "three";

import { getRandomVector } from "../lib/utils";
import { boundingDim } from "../world/run";

export type boidParamsType = {
  turnaroundFactor: number;

  separationRange: number;
  separationFactor: number;

  alignmentRange: number;
  alignmentFactor: number;

  cohesionRange: number;
  cohesionFactor: number;
};

export default class Boid0 {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  flock: Boid0[];

  rotationMatrix: THREE.Matrix4;
  targetQuaternion: THREE.Quaternion;

  constructor(geo: THREE.BufferGeometry, mat: THREE.Material) {
    this.mesh = new THREE.Mesh(geo, mat);
    this.velocity = getRandomVector();

    this.flock = [];

    this.rotationMatrix = new THREE.Matrix4();
    this.targetQuaternion = new THREE.Quaternion();
    this.makeRotation();
  }

  move(boidParams: boidParamsType) {
    this.mesh.position.add(this.velocity);

    this.velocity.clampLength(0, 1);

    // update position => make rotation
    this.makeRotation();

    // stayinside boundaries
    this.stayInsideBoundary(boidParams.turnaroundFactor);
  }

  separation(separationRange: number, separationFactor: number) {
    let count = 0;
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

  setFlock(flock: Boid0[]) {
    this.flock = flock;
  }
}
