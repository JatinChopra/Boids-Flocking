import * as THREE from "three";

import { getRandomVector } from "../lib/utils";
import { repulsionSphere } from "../world/run";
import Predator0 from "./Predator";

export type boidParamsType = {
  z_movement: boolean;
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

export default class Boid {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  health: number;
  flock: Boid[];
  predators: Predator0[];

  separationCircleGeo?: THREE.CircleGeometry;
  alignmentCircleGeo?: THREE.CircleGeometry;
  cohesionCircleGeo?: THREE.CircleGeometry;

  separationBoundaryMesh?: THREE.LineSegments;
  alignmentBoundaryMesh?: THREE.LineSegments;
  cohesionBoundaryMesh?: THREE.LineSegments;

  rotationMatrix: THREE.Matrix4;
  targetQuaternion: THREE.Quaternion;

  boundingDim: THREE.Vector3;
  boundingArea: "dome" | "box";
  escapeRange: number;

  constructor(
    geo: THREE.BufferGeometry,
    mat: THREE.Material,

    boundingDim: THREE.Vector3,
    boundingArea: "dome" | "box",
    escapeRange: number
  ) {
    this.escapeRange = escapeRange;
    this.boundingDim = boundingDim;
    this.boundingArea = boundingArea;
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.castShadow = true;
    const pos = getRandomVector().multiplyScalar(20);
    pos.setComponent(1, Math.abs(pos.getComponent(1)));
    // this.mesh.position.set(0, 150, 0);
    this.mesh.position.copy(pos);
    this.velocity = getRandomVector();
    this.acceleration = new THREE.Vector3(0, 0, 0);
    this.health = 3;

    this.flock = [];
    this.predators = [];

    this.rotationMatrix = new THREE.Matrix4();
    this.targetQuaternion = new THREE.Quaternion();
    this.makeRotation();
  }

  move(boidParams: boidParamsType, repulsionPoints: repulsionSphere[]) {
    if (!boidParams.z_movement) {
      this.mesh.position.z = 0;
    }

    this.checkHealth();

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

    this.avoidObstacles(repulsionPoints);

    this.mesh.position.add(this.velocity);

    this.escape(boidParams.escapeRange, boidParams.escapeFactor);
    this.velocity.clampLength(0, 1.5);

    // update position => make rotation
    this.makeRotation();

    // stayinside boundaries
    // this.stayInsideBoundary(boidParams.turnaroundFactor);
    if (this.boundingArea == "box") {
      this.stayInsideBox(boidParams.turnaroundFactor);
    }
    if (this.boundingArea == "dome") {
      this.stayInsideSphere(boidParams.turnaroundFactor);
    }

    this.stayAbovePlane();
  }

  avoidObstacles(repulsionPoints: repulsionSphere[]) {
    for (let i = 0; i < repulsionPoints.length; i++) {
      const additionalOffset = 2;

      const point = repulsionPoints[i];

      const pos = new THREE.Vector3();
      point.mesh.getWorldPosition(pos);
      const distance = this.mesh.position.distanceTo(pos);

      if (distance < point.radius + additionalOffset) {
        const oppositeVector = new THREE.Vector3()
          .subVectors(this.mesh.position, pos)
          .normalize()
          .multiplyScalar(10);

        const steer = new THREE.Vector3().subVectors(
          oppositeVector,
          this.velocity
        );

        this.velocity.add(steer.multiplyScalar(0.05));
      }
    }
  }

  checkHealth() {
    if (this.health <= 0) {
      // create an explosion here

      this.mesh.geometry.dispose();
      this.mesh.parent?.remove(this.mesh);
    }
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

  stayAbovePlane() {
    if (this.mesh.position.y < 0) {
      // console.log("stopping");
      this.velocity.setComponent(1, this.velocity.getComponent(1) + 1);
    }
  }

  stayInsideSphere(turnaroundFactor: number) {
    // calculate the distacne and if dist > max distance
    // get the direction vector  => normalize => scale to -turn around factor ( got the inward force )

    //  vel + inward force

    const maxDistance = this.boundingDim.getComponent(0) - 20; // 100 radius
    const center = new THREE.Vector3(0, 0, 0);
    const distance = this.mesh.position.distanceTo(center);

    if (distance > maxDistance) {
      const dirVector = new THREE.Vector3()
        .subVectors(this.mesh.position, center)
        .normalize();
      const inwardForce = dirVector.multiplyScalar(-turnaroundFactor);
      this.velocity.add(inwardForce);
    }
  }

  stayInsideBox(turnaroundFactor: number) {
    for (let axis = 0; axis < 3; axis++) {
      let bound = this.boundingDim.getComponent(axis) / 2;

      const poscomponent = this.mesh.position.getComponent(axis);

      if (axis == 1 && poscomponent > this.boundingDim.getComponent(axis)) {
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

      if (poscomponent < -bound) {
        if (axis != 1)
          this.velocity.setComponent(
            axis,
            this.velocity.getComponent(axis) + turnaroundFactor
          );
      }
    }
  }

  stayInsideBoundary(turnaroundFactor: number) {
    const innerBoundary = 7;

    for (let axis = 0; axis < 3; axis++) {
      const pos = this.mesh.position.getComponent(axis);
      let bounds = this.boundingDim.getComponent(axis) / 2 - innerBoundary;

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

  setFlock(flock: Boid[]) {
    this.flock = flock;
  }
}
