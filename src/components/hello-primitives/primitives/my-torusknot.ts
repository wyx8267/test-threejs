import { TorusKnotGeometry } from "three";

const radius = 3.5; // ui: radius
const tubeRadius = 1.5; // ui: tubeRadius
const radialSegments = 8; // ui: radialSegments
const tubularSegments = 64; // ui: tubularSegments
const p = 3; // ui: p
const q = 4; // ui: q
const myTorusKnot = new TorusKnotGeometry(
  radius,
  tubeRadius,
  tubularSegments,
  radialSegments,
  p,
  q
);

export default myTorusKnot;
