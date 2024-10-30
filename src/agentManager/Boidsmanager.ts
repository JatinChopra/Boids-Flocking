import * as THREE from "three";
import Boid from "../agents/Boid";
import Predator, { predatorParamsType } from "../agents/Predator";

import { boidParamsType } from "../agents/Boid";
import Projectile from "../agents/Projectile";
import ExplosionParticle from "../particles/ExplosionParticle";

import type { repulsionSphere } from "../world/run";

export default class BoidsManager {
  flock: Boid[];
  predators: Predator[];
  explosionParticles: ExplosionParticle[];
  projectiles: Projectile[];
  params: boidParamsType;
  oldParams: boidParamsType;
  predatorParams: predatorParamsType;
  scene: THREE.Scene;

  separationHelperGeo: THREE.CircleGeometry;
  alignmentHelperGeo: THREE.CircleGeometry;
  cohesionHelperGeo: THREE.CircleGeometry;
  repulsionPoints: repulsionSphere[];

  constructor(
    scene: THREE.Scene,
    quantity: number,
    params: boidParamsType,
    predatorParams: predatorParamsType,
    repulsionPoints: repulsionSphere[]
  ) {
    this.projectiles = [];
    this.explosionParticles = [];
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
    this.repulsionPoints = repulsionPoints;
  }

  private fillOtherBoids() {
    for (let i = 0; i < this.flock.length; i++) {
      this.flock[i].setFlock(this.flock);
    }
  }

  createPredator(quantity: number) {
    const geo = new THREE.ConeGeometry(2, 5);
    geo.rotateX(Math.PI * -0.5);
    const mat = new THREE.MeshStandardMaterial({ color: 0xff0000 });

    for (let i = 0; i < quantity; i++) {
      const predator = new Predator(
        i,
        geo,
        mat,
        this.flock,
        this.projectiles,
        this.scene
      );
      this.predators.push(predator);
      this.scene.add(predator.mesh);
    }

    // once prdator has been created push them into ever boid list
    for (let i = 0; i < this.flock.length; i++) {
      this.flock[i].predators = this.predators;
    }
  }

  updateProjectiles() {
    for (let projectile of this.projectiles) {
      // destroy if they dont exist
      if (this.scene.children.includes(projectile.mesh)) {
        projectile.shoot();
      } else {
        // remove from array
        const idx = this.projectiles.indexOf(projectile);
        this.projectiles.splice(idx, 1);
      }
    }
  }

  updatePredators() {
    for (let predator of this.predators) {
      predator.move(this.predatorParams);
      // create a particle and add it to scene
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 1.2, 1.2),
        new THREE.MeshBasicMaterial({ color: 0xffff00 })
      );

      box.position.copy(predator.mesh.position);
      // this.scene.add(box);
    }
  }

  private createFlock(quantity: number) {
    const newFlock: Boid[] = [];
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

  addNewBoid() {
    const newBoid = this.createNewBoid();
    this.flock.push(newBoid);

    this.scene.add(newBoid.mesh);
  }

  updateExplosionParticle() {
    for (let i = 0; i < this.explosionParticles.length; i++) {
      const particle = this.explosionParticles[i];
      // check their lifespan and destroy from scene as well as arry

      if (particle.life <= 0) {
        particle.mesh.geometry.dispose();
        this.scene.remove(particle.mesh);
        const idx = this.explosionParticles.indexOf(particle);
        this.explosionParticles.splice(idx, 1);
      }

      particle.updateParticle();
    }
  }

  updateFlockPosition() {
    let idx = 0;
    for (let boid of this.flock) {
      if (this.scene.children)
        if (boid.health <= 0) {
          // create explosion particles
          for (let i = 0; i < 25; i++) {
            const particle = new ExplosionParticle(
              this.scene,
              boid.mesh.position
            );
            this.explosionParticles.push(particle);
          }

          // remove boid from array
          boid.mesh.geometry.dispose();
          this.scene.remove(boid.mesh);
          const idx = this.flock.indexOf(boid);
          this.flock.splice(idx, 1);
        }

      boid.move(this.params, this.repulsionPoints);

      if (idx == 0) {
        this.updateBoundaries(boid);
        idx++;
      }
    }
  }

  private createBoundaries(boid: Boid) {
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

  private updateBoundaries(boid: Boid) {
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

  private createNewBoid(): Boid {
    const boid = new Boid();
    return boid;
  }
}
