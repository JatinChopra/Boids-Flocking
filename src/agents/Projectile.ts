import * as THREE from "three";
import Predator from "./Predator";
import Boid from "./Boid";

export default class Projectile {
  mesh: THREE.Mesh;
  createdBy: Predator;
  target?: Boid;
  velocity: THREE.Vector3;
  scene: THREE.Scene;

  constructor(predator: Predator, scene: THREE.Scene) {
    this.scene = scene;
    const geo = new THREE.SphereGeometry(0.5);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    this.mesh = new THREE.Mesh(geo, mat);
    this.createdBy = predator;
    this.velocity = predator.velocity.clone().addScalar(2);
  }

  setTarget(boid: Boid) {
    this.target = boid;
  }

  shoot() {
    // distance to target
    if (this.target) {
      const distance = this.mesh.position.distanceTo(this.target.mesh.position);

      if (distance < 1) {
        // destroy
        this.mesh.geometry.dispose();
        this.scene.remove(this.mesh);

        this.target.mesh.geometry.dispose();
        this.scene.remove(this.target.mesh);
      }

      // vector to target
      const targetVec = new THREE.Vector3().subVectors(
        this.target.mesh.position,
        this.mesh.position
      );
      targetVec.normalize().multiplyScalar(1.5); // chasing factor => more than

      const steer = targetVec.sub(this.velocity).multiplyScalar(0.08); // steering factor => less utna curve

      this.velocity.add(steer);
      this.velocity.clampLength(0, 2.0);

      this.mesh.position.add(this.velocity);
    }
  }

  //   createProjectileMesh(): THREE.Mesh {
  //     const sphere = new THREE.Mesh(geo, mat);
  //     return sphere;
  //   }
}
