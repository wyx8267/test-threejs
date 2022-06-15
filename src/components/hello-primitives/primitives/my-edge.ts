import { BoxGeometry, EdgesGeometry, SphereGeometry } from "three";

// const size = 8;
// const widthSegments = 2;
// const heightSegments = 2;
// const depthSegments = 2;
// const boxGeometry = new BoxGeometry(
//     size, size, size,
//     widthSegments, heightSegments, depthSegments);
// const myEdge = new EdgesGeometry(boxGeometry);

const radius = 7;
const widthSegments = 6;
const heightSegments = 3;
const sphereGeometry = new SphereGeometry(
    radius, widthSegments, heightSegments);
const thresholdAngle = 45;  // ui: thresholdAngle
const myEdge = new EdgesGeometry(sphereGeometry, thresholdAngle);

export default myEdge;