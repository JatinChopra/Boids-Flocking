import * as THREE from "three";

import { getRandomVector } from "../lib/utils";
import { boundingDim } from "../world/run";
import Predator0 from "./Predator";

export type boidParamsType = {
  boundary: boolean;
  turnaroundFactor: number;

  separationRange: number;
  separationFactor: number;

  alignmentRange: number;
  alignmentFactor: number;

  cohesionRange: number;
  cohesionFactor: number;

  escapeRange: number;
  escapeFactor: number;
};

export default class Boid0 {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  flock: Boid0[];
  predators: Predator0[];

  separationCircleGeo?: THREE.CircleGeometry;
  alignmentCircleGeo?: THREE.CircleGeometry;
  cohesionCircleGeo?: THREE.CircleGeometry;

  separationBoundaryMesh?: THREE.LineSegments;
  alignmentBoundaryMesh?: THREE.LineSegments;
  cohesionBoundaryMesh?: THREE.LineSegments;

  rotationMatrix: THREE.Matrix4;
  targetQuaternion: THREE.Quaternion;

  constructor(geo: THREE.BufferGeometry, mat: THREE.Material) {
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(getRandomVector().multiplyScalar(100));
    this.velocity = getRandomVector();
    this.velocity.z = 0;
    this.mesh.position.z = 0;
    this.acceleration = new THREE.Vector3(0, 0, 0);

    this.flock = [];
    this.predators = [];

    this.rotationMatrix = new THREE.Matrix4();
    this.targetQuaternion = new THREE.Quaternion();
    this.makeRotation();
  }

  move(boidParams: boidParamsType) {
    this.acceleration.set(0, 0, 0);

    const separation = this.separation(
      boidParams.separationRange,
      boidParams.separationFactor
    );

    const alignment = this.alignment(
      boidParams.alignmentRange,
      boidParams.alignmentFactor
    );

    const cohesion = this.cohesion(
      boidParams.cohesionRange,
      boidParams.cohesionFactor
    );

    separation && this.acceleration.add(separation);
    alignment && this.acceleration.add(alignment);
    cohesion && this.acceleration.add(cohesion);

    this.velocity.add(this.acceleration);
    this.mesh.position.add(this.velocity);

    this.escape(boidParams.escapeRange, boidParams.escapeFactor);
    this.velocity.clampLength(0, 1);

    // update position => make rotation
    this.makeRotation();

    // stayinside boundaries
    this.stayInsideBoundary(boidParams.turnaroundFactor);
  }

  escape(escapeRange: number, escapeFactor: number) {
    for (let predator of this.predators) {
      const safeRange = escapeRange;

      const distance = this.mesh.position.distanceTo(predator.mesh.position);

      if (distance < safeRange) {
        const escapeVector = new THREE.Vector3().subVectors(
          this.mesh.position,
          predator.mesh.position
        );

        escapeVector.divideScalar(distance * distance);

        // const steer = escapeVector.sub(this.velocity).multiplyScalar(0.5);

        // this.velocity.add(steer);
        this.velocity.add(escapeVector.multiplyScalar(escapeFactor));
      }
    }
  }

  addPredator(predator: Predator0) {
    this.predators.push(predator);
  }

  separation(
    separationRange: number,
    separationFactor: number
  ): THREE.Vector3 | undefined {
    const separationVector = new THREE.Vector3();
    let count = 0;

    for (let other of this.flock) {
      if (this === other) continue;

      const distance = this.mesh.position.distanceTo(other.mesh.position);

      if (distance < separationRange) {
        const avoidVector = new THREE.Vector3().subVectors(
          this.mesh.position,
          other.mesh.position
        );

        avoidVector.divideScalar(distance * distance);

        separationVector.add(avoidVector);
        count++;
      }
    }

    if (count > 0) {
      return separationVector.multiplyScalar(separationFactor);
    }
  }

  alignment(alignmentRange: number, alignmentFactor: number) {
    const avgVelocity = new THREE.Vector3(0, 0, 0);
    let totalWeight = 0;

    for (let other of this.flock) {
      if (this === other) continue;

      const distance = this.mesh.position.distanceTo(other.mesh.position);

      if (distance < alignmentRange) {
        const weight = 1 - distance / alignmentRange;
        avgVelocity.add(other.velocity.clone().multiplyScalar(weight));
        totalWeight += weight;
      }
    }

    if (totalWeight > 0) {
      avgVelocity.divideScalar(totalWeight);

      const steer = new THREE.Vector3().subVectors(avgVelocity, this.velocity);
      steer.multiplyScalar(alignmentFactor);

      return steer;
    }
  }

  cohesion(
    cohesionRange: number,
    cohesionFactor: number
  ): THREE.Vector3 | undefined {
    const avgPosition = new THREE.Vector3(0, 0, 0);
    let totalWeight = 0;

    for (let other of this.flock) {
      if (this === other) continue;

      const distance = this.mesh.position.distanceTo(other.mesh.position);

      if (distance < cohesionRange) {
        const weight = 1 - distance / cohesionRange;
        avgPosition.add(other.mesh.position.clone().multiplyScalar(weight));
        totalWeight += weight;
      }
    }

    if (totalWeight > 0) {
      avgPosition.divideScalar(totalWeight);

      const steer = new THREE.Vector3().subVectors(
        avgPosition,
        this.mesh.position
      );

      steer.multiplyScalar(cohesionFactor);

      return steer;
    }
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
