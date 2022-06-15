import { RingGeometry } from "three";

const innerRadius = 2; // ui: innerRadius
const outerRadius = 7; // ui: outerRadius
const thetaSegments = 18; // ui: thetaSegments
const phiSegments = 2; // ui: phiSegments
const thetaStart = Math.PI * 0.25; // ui: thetaStart
const thetaLength = Math.PI * 1.5; // ui: thetaLength
const myRing = new RingGeometry(
  innerRadius,
  outerRadius,
  thetaSegments,
  phiSegments,
  thetaStart,
  thetaLength
);

export default myRing;
