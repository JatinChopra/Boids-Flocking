import * as THREE from "three";
import Predator from "./Predator";
import Boid from "./Boid";
import TrailParticle from "../particles/TrailParticle";

export default class Projectile {
  mesh: THREE.Mesh;
  createdBy: Predator;
  target?: Boid;
  hit: boolean;
  velocity: THREE.Vector3;
  scene: THREE.Scene;
  particles: TrailParticle[];
  lastParticleTime: number;
  shootSoundPlayed: boolean;

  static clock = new THREE.Clock();

  constructor(predator: Predator, scene: THREE.Scene) {
    this.scene = scene;
    this.shootSoundPlayed = false;

    this.hit = false;
    const geo = new THREE.SphereGeometry(0.8);
    const mat = new THREE.MeshStandardMaterial({ color: 0xff8800 });
    this.mesh = new THREE.Mesh(geo, mat);
    this.createdBy = predator;
    this.velocity = predator.velocity.clone().addScalar(2);
    this.particles = [];
    this.lastParticleTime = Projectile.clock.getElapsedTime();
  }

  setTarget(boid: Boid) {
    this.target = boid;
  }

  shoot() {
    // distance to target

    for (let particle of this.particles) {
      if (!this.scene.children.includes(particle.mesh)) {
        // remove this from array
        const idx = this.particles.indexOf(particle);
        this.particles.splice(idx, 1);
      }
      particle.animate();
    }

    if (this.target) {
      const distance = this.mesh.position.distanceTo(this.target.mesh.position);

      if (distance < 1) {
        // destroy
        if (!this.hit) {
          this.target.health -= 3;
          this.hit = true;
        }

        this.mesh.geometry.dispose();
        this.scene.remove(this.mesh);

        // this.target.mesh.geometry.dispose();
        // this.scene.remove(this.target.mesh);
      }

      // vector to target
      const targetVec = new THREE.Vector3().subVectors(
        this.target.mesh.position,
        this.mesh.position
      );
      targetVec.normalize().multiplyScalar(2.0); // chasing factor => more than

      const steer = targetVec.sub(this.velocity).multiplyScalar(0.2); // steering factor => less utna curve

      this.velocity.add(steer);
      this.velocity.clampLength(0, 2.4);

      this.mesh.position.add(this.velocity);
    }
  }

  //   createProjectileMesh(): THREE.Mesh {
  //     const sphere = new THREE.Mesh(geo, mat);
  //     return sphere;
  //   }
}
