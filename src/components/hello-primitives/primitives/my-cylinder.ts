import { CylinderGeometry } from "three";

const radiusTop = 4; // ui: radiusTop
const radiusBottom = 4; // ui: radiusBottom
const height = 8; // ui: height
const radialSegments = 12; // ui: radialSegments
const heightSegments = 2; // ui: heightSegments
const openEnded = false; // ui: openEnded
const thetaStart = Math.PI * 0.25; // ui: thetaStart
const thetaLength = Math.PI * 1.5; // ui: thetaLength

const myCylinder = new CylinderGeometry(
  radiusTop,
  radiusBottom,
  height,
  radialSegments,
  heightSegments,
  openEnded,
  thetaStart,
  thetaLength
);
export default myCylinder;
