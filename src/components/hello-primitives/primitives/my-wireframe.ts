import { WireframeGeometry, BoxGeometry } from "three";

const size = 8;
const widthSegments = 2;  // ui: widthSegments
const heightSegments = 2;  // ui: heightSegments
const depthSegments = 2;  // ui: depthSegments

const myWireframe = new WireframeGeometry(
    new BoxGeometry(
      size, size, size,
      widthSegments, heightSegments, depthSegments));

export default myWireframe;