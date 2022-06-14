import { CircleGeometry } from "three";

const radius = 7;
const segments = 24;
const thetaStart = Math.PI * 0.25;  // ui: thetaStart
const thetaLength = Math.PI * 1.5;  // ui: thetaLength

// const myCircle = new CircleGeometry(radius, segments)
const myCircle = new CircleGeometry(radius, segments, thetaStart, thetaLength)

export default myCircle;