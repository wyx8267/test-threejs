import { TorusGeometry } from "three";

const radius = 5;  // ui: radius
const tubeRadius = 2;  // ui: tubeRadius
const radialSegments = 7;  // ui: radialSegments
const tubularSegments = 24;  // ui: tubularSegments
const myTorus = new TorusGeometry(
    radius, tubeRadius,
  radialSegments, tubularSegments);
    
export default myTorus;