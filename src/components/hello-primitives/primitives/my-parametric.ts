import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry.js";

const slices = 25; // ui: slices
const stacks = 25; // ui: stacks
// from: https://github.com/mrdoob/three.js/blob/b8d8a8625465bd634aa68e5846354d69f34d2ff5/examples/js/ParametricGeometries.js

function klein(v: number, u: number, target: any) {
  u *= Math.PI;
  v *= 2 * Math.PI;
  u = u * 2;

  let x;
  let z;

  if (u < Math.PI) {
    x =
      3 * Math.cos(u) * (1 + Math.sin(u)) +
      2 * (1 - Math.cos(u) / 2) * Math.cos(u) * Math.cos(v);
    z =
      -8 * Math.sin(u) - 2 * (1 - Math.cos(u) / 2) * Math.sin(u) * Math.cos(v);
  } else {
    x =
      3 * Math.cos(u) * (1 + Math.sin(u)) +
      2 * (1 - Math.cos(u) / 2) * Math.cos(v + Math.PI);
    z = -8 * Math.sin(u);
  }

  const y = -2 * (1 - Math.cos(u) / 2) * Math.sin(v);

  target.set(x, y, z).multiplyScalar(0.75);
}

const myParametric = new ParametricGeometry(klein, slices, stacks);

export default myParametric;
