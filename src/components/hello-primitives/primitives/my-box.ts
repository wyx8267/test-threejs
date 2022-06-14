import { BoxGeometry } from "three";

const width = 8;
const height = 8;
const depth = 8;
const widthSegments = 4;  // ui: widthSegments
const heightSegments = 4;  // ui: heightSegments
const depthSegments = 4;  // ui: depthSegments

const myBox = new BoxGeometry(width, height, depth);
// const myBox = new BoxGeometry(width, height, depth,widthSegments, heightSegments, depthSegments);

export default myBox;
