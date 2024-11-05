import * as THREE from "three";

const colors = [
  0xffff00, // Yellow
  0xff6347, // Tomato
  0xffd700, // Gold
];

function getColorfulMaterial() {
  const randomIndex = Math.floor(Math.random() * colors.length);
  return new THREE.MeshBasicMaterial({ color: colors[randomIndex] });
}

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
    this.life = 30;
    this.maxDistance = Math.random() * 10 + 5;
    this.maxSize = 4;
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

  createParticleObject(): THREE.Mesh {
    const radius = Math.random() * 1 + 0.5;
    const geometry = new THREE.SphereGeometry(radius);
    const material = getColorfulMaterial();
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
