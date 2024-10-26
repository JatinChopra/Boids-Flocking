import * as THREE from "three";

export function getRandomVector() {
  const x = Math.random() * 2 - 1;
  const y = Math.random() * 2 - 1;
  const z = Math.random() * 2 - 1;

  return new THREE.Vector3(x, y, z).normalize();
}
