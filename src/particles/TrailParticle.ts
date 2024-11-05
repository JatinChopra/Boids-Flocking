import * as THREE from "three";

export default class TrailParticle {
  scene: THREE.Scene;
  mesh: THREE.Mesh;
  life: number;
  maxSize: number;
  minSize: number;
  fullLife: number;

  constructor(
    scene: THREE.Scene,
    position: THREE.Vector3,
    maxSize: number,
    minsize: number,
    life: number
  ) {
    this.fullLife = life;
    this.scene = scene;
    this.maxSize = maxSize;
    this.minSize = minsize;
    this.mesh = this.createParticle(position);
    this.life = life; // 15
  }

  animate() {
    if (this.life < 0) {
      this.mesh.geometry.dispose();
      this.scene.remove(this.mesh);
    }

    // const scaleFactor = (this.life * 20) / 100;
    let scaleFactor = this.life / this.fullLife;

    // const scaleFactor = 1;

    this.mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
    this.life -= 1;
  }

  // create and push particles into array
  createParticle(position: THREE.Vector3): THREE.Mesh {
    const particle = new THREE.Mesh(
      new THREE.SphereGeometry(this.maxSize),
      // new THREE.MeshStandardMaterial({ color: 0x00ffff })
      new THREE.MeshStandardMaterial({ color: 0xd7f705 })
    );
    particle.castShadow = true;

    this.scene.add(particle);

    particle.position.copy(position);
    return particle;
  }
}
