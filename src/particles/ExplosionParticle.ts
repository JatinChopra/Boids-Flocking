import * as THREE from "three";

export default class ExplosionParticles {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  maxDistance: number;

  scene: THREE.Scene;
  mesh: THREE.Mesh;

  life: number;
  maxSize: number;
  minSize: number;

  constructor(scene: THREE.Scene, pos: THREE.Vector3) {
    this.scene = scene;
    this.velocity = getRandomVector();
    this.position = pos;

    this.mesh = this.createParticleObject();
    this.life = 100;
    (this.maxDistance = Math.random() * 10 + 5), (this.maxSize = 4);
    this.minSize = 0.5;
  }

  updateParticle() {
    // loop over all particles => incremement the position by velocity( normalized & scaled to controls )
    // i wanna see if i can make them like firewok particles

    const distance = this.mesh.position.distanceTo(this.position);
    if (!(distance > this.maxDistance)) {
      this.mesh.position.add(this.velocity);
    }

    this.life -= 1;
  }

  //   createParticles(num: number): explosionParticle[] {
  //     const particleList: explosionParticle[] = [];
  //     for (let i = 0; i < num; i++) {
  //       const particle = this.createParticleObject();
  //       particleList.push(particle);
  //       this.scene.add(particle.mesh);
  //     }
  //     return particleList;
  //   }

  createParticleObject(): THREE.Mesh {
    const radius = 1;
    const geometry = new THREE.SphereGeometry(radius);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(this.position); // set the initia pos
    this.scene.add(mesh);
    return mesh;
  }
}

// get random vector
function getRandomVector(): THREE.Vector3 {
  const x = Math.random() * -0.5;
  const y = Math.random() * -0.5;
  //   const y = Math.random();
  const z = Math.random() * -0.5;

  return new THREE.Vector3(x, y, z).normalize();
}
