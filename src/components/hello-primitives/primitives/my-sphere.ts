import { SphereGeometry } from "three";

const radius = 7; // ui: radius
const widthSegments = 12; // ui: widthSegments
const heightSegments = 8; // ui: heightSegments
const phiStart = Math.PI * 0.25; // ui: phiStart
const phiLength = Math.PI * 1.5; // ui: phiLength
const thetaStart = Math.PI * 0.25; // ui: thetaStart
const thetaLength = Math.PI * 0.5; // ui: thetaLength
const mySphere = new SphereGeometry(
  radius,
  widthSegments,
  heightSegments,
  phiStart,
  phiLength,
  thetaStart,
  thetaLength
);

export default mySphere;
