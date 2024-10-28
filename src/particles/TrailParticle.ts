import * as THREE from "three";

export default class TrailParticle {
  scene: THREE.Scene;
  mesh: THREE.Mesh;
  life: number;
  maxSize: number;
  minSize: number;

  constructor(scene: THREE.Scene, position: THREE.Vector3) {
    this.scene = scene;
    this.maxSize = 1.5;
    this.minSize = 0.5;
    this.mesh = this.createParticle(position);
    this.life = 3;
  }

  animate() {
    if (this.life < 0) {
      this.mesh.geometry.dispose();
      this.scene.remove(this.mesh);
    }

    const scaleFactor = (this.life * 20) / 80;
    this.mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
    this.life -= 1;
  }

  // create and push particles into array
  createParticle(position: THREE.Vector3): THREE.Mesh {
    const particle = new THREE.Mesh(
      new THREE.SphereGeometry(this.maxSize),
      new THREE.MeshStandardMaterial({ color: 0x00ffff })
    );

    this.scene.add(particle);

    particle.position.copy(position);
    return particle;
  }
}
