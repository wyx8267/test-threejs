import { LatheGeometry, Vector2 } from "three";

const points = [];
for (let i = 0; i < 10; ++i) {
  points.push(new Vector2(Math.sin(i * 0.2) * 3 + 3, (i - 5) * 0.8));
}
const segments = 12;  // ui: segments
const phiStart = Math.PI * 0.25;  // ui: phiStart
const phiLength = Math.PI * 1.5;  // ui: phiLength

const myLathe = new LatheGeometry(points, segments, phiStart, phiLength);

export default myLathe;
