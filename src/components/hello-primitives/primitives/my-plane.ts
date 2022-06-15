import { PlaneGeometry } from "three";

const width = 9; // ui: width
const height = 9; // ui: height
const widthSegments = 2; // ui: widthSegments
const heightSegments = 2; // ui: heightSegments
const myPlane = new PlaneGeometry(width, height, widthSegments, heightSegments);

export default myPlane;
