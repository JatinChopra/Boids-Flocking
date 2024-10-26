import * as THREE from "three";
import Boid0 from "../agents/Boid0";
import Predator0, { predatorParamsType } from "../agents/Predator0";

import { boidParamsType } from "../agents/Boid0";

export default class BoidsManager {
  flock: Boid0[];
  predators: Predator0[];
  params: boidParamsType;
  oldParams: boidParamsType;
  predatorParams: predatorParamsType;
  scene: THREE.Scene;

  separationHelperGeo: THREE.CircleGeometry;
  alignmentHelperGeo: THREE.CircleGeometry;
  cohesionHelperGeo: THREE.CircleGeometry;

  constructor(
    scene: THREE.Scene,
    quantity: number,
    params: boidParamsType,
    predatorParams: predatorParamsType
  ) {
    this.scene = scene;
    this.params = params;
    this.oldParams = { ...params };
    this.predatorParams = predatorParams;
    this.flock = this.createFlock(quantity); // create all the boids
    this.predators = [];
    this.fillOtherBoids();

    this.separationHelperGeo = new THREE.CircleGeometry(params.separationRange);
    this.alignmentHelperGeo = new THREE.CircleGeometry(params.alignmentRange);
    this.cohesionHelperGeo = new THREE.CircleGeometry(params.cohesionRange);
  }

  private fillOtherBoids() {
    for (let i = 0; i < this.flock.length; i++) {
      this.flock[i].setFlock(this.flock);
    }
  }

  createPredator(quantity: number) {
    const geo = new THREE.ConeGeometry(2, 5);
    geo.rotateX(Math.PI * -0.5);
    const mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    for (let i = 0; i < quantity; i++) {
      const predator = new Predator0(geo, mat, this.flock);
      this.predators.push(predator);
      this.scene.add(predator.mesh);
    }

    // once prdator has been created push them into ever boid list
    for (let i = 0; i < this.flock.length; i++) {
      this.flock[i].predators = this.predators;
    }
  }

  updatePredators() {
    for (let predator of this.predators) {
      predator.move(this.predatorParams);
    }
  }

  private createFlock(quantity: number) {
    const newFlock: Boid0[] = [];
    for (let i = 0; i < quantity; i++) {
      const newBoid = this.createNewBoid();
      newFlock.push(newBoid);
      this.scene.add(newBoid.mesh);

      //   if boid 0 then create the boundaries
      if (i == 0) {
        this.createBoundaries(newBoid);
      }
    }

    return newFlock;
  }

  updateFlockPosition() {
    let idx = 0;
    for (let boid of this.flock) {
      boid.move(this.params);

      if (idx == 0) {
        this.updateBoundaries(boid);
        idx++;
      }
    }
  }

  private createBoundaries(boid: Boid0) {
    // separation boundary
    boid.separationCircleGeo = new THREE.CircleGeometry(
      this.params.separationRange
    );
    boid.separationBoundaryMesh = new THREE.LineSegments(
      new THREE.EdgesGeometry(boid.separationCircleGeo),
      new THREE.LineBasicMaterial({ color: 0xff0000 })
    );
    boid.separationBoundaryMesh.visible = this.params.boundary;

    // alignment boundary
    boid.alignmentCircleGeo = new THREE.CircleGeometry(
      this.params.alignmentRange
    );
    boid.alignmentBoundaryMesh = new THREE.LineSegments(
      new THREE.EdgesGeometry(boid.alignmentCircleGeo),
      new THREE.LineBasicMaterial({ color: 0xffff00 })
    );
    boid.alignmentBoundaryMesh.visible = this.params.boundary;

    // cohesion boundary
    boid.cohesionCircleGeo = new THREE.CircleGeometry(
      this.params.cohesionRange
    );
    boid.cohesionBoundaryMesh = new THREE.LineSegments(
      new THREE.EdgesGeometry(boid.cohesionCircleGeo),
      new THREE.LineBasicMaterial({ color: 0x00ffff })
    );
    boid.cohesionBoundaryMesh.visible = this.params.boundary;

    this.scene.add(boid.separationBoundaryMesh);
    this.scene.add(boid.alignmentBoundaryMesh);
    this.scene.add(boid.cohesionBoundaryMesh);
  }

  private updateBoundaries(boid: Boid0) {
    if (this.oldParams.separationRange != this.params.separationRange) {
      if (boid.separationBoundaryMesh) {
        // find the diff in radius and scale according to that
        const scale =
          this.params.separationRange / this.oldParams.separationRange;
        boid.separationBoundaryMesh.scale.multiplyScalar(scale);
      }

      this.oldParams = { ...this.params };
    }

    if (this.oldParams.alignmentRange != this.params.alignmentRange) {
      if (boid.alignmentBoundaryMesh) {
        console.log("changing alignment");
        // find the diff in radius and scale according to that
        const scale =
          this.params.alignmentRange / this.oldParams.alignmentRange;
        boid.alignmentBoundaryMesh.scale.multiplyScalar(scale);
      }

      this.oldParams = { ...this.params };
    }

    if (this.oldParams.cohesionRange != this.params.cohesionRange) {
      if (boid.cohesionBoundaryMesh) {
        // find the diff in radius and scale according to that
        const scale = this.params.cohesionRange / this.oldParams.cohesionRange;
        boid.cohesionBoundaryMesh.scale.multiplyScalar(scale);
      }

      this.oldParams = { ...this.params };
    }

    if (this.oldParams.boundary != this.params.boundary) {
      if (boid.separationBoundaryMesh)
        boid.separationBoundaryMesh.visible = this.params.boundary;
      if (boid.alignmentBoundaryMesh)
        boid.alignmentBoundaryMesh.visible = this.params.boundary;
      if (boid.cohesionBoundaryMesh)
        boid.cohesionBoundaryMesh.visible = this.params.boundary;

      this.oldParams = { ...this.params };
    }

    boid.separationBoundaryMesh?.position.copy(boid.mesh.position);
    boid.cohesionBoundaryMesh?.position.copy(boid.mesh.position);
    boid.alignmentBoundaryMesh?.position.copy(boid.mesh.position);
  }

  private createNewBoid(): Boid0 {
    const geo = new THREE.ConeGeometry(1.2, 3.2);
    geo.rotateX(Math.PI * -0.5);

    const mat = new THREE.MeshNormalMaterial();

    const boid = new Boid0(geo, mat);
    return boid;
  }
}
