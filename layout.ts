import * as THREE from "three";

export function attraction(p: THREE.Vector3, q: THREE.Vector3, A = 0.0) {
  const d = new THREE.Vector3(q.x - p.x, q.y - p.y, q.z - p.z);
  const r = d.length();
  const e = d.clone().normalize();
  return e.multiplyScalar(A * r);
}

export function repulsion(p: THREE.Vector3, q: THREE.Vector3, R = 0.0) {
  const d = new THREE.Vector3(q.x - p.x, q.y - p.y, q.z - p.z);
  const r = d.length();
  const e = d.clone().normalize();
  if (r < 1e-4) return new THREE.Vector3(0, 0, 0);
  return e.multiplyScalar(-R / r ** 2);
}
