import { ConeGeometry } from "three";

const radius = 6;
const height = 8;
const radialSegments = 16;
const heightSegments = 2;
const openEnded = true;
const thetaStart = Math.PI * 0.25;
const thetaLength = Math.PI * 1.5;

const myCone = new ConeGeometry(
  radius,
  height,
  radialSegments,
  heightSegments,
  openEnded,
  thetaStart,
  thetaLength
);
export default myCone;
