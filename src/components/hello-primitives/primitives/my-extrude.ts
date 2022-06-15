import {
  CubicBezierCurve3,
  CurvePath,
  ExtrudeGeometry,
  Shape,
  Vector2,
  Vector3,
} from "three";

// const shape = new Shape();
// const x = -2.5;
// const y = -5;
// shape.moveTo(x + 2.5, y + 2.5);
// shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
// shape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
// shape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5);
// shape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5);
// shape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
// shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);

// const extrudeSettings = {
//   steps: 2,  // ui: steps
//   depth: 2,  // ui: depth
//   bevelEnabled: true,  // ui: bevelEnabled
//   bevelThickness: 1,  // ui: bevelThickness
//   bevelSize: 1,  // ui: bevelSize
//   bevelSegments: 2,  // ui: bevelSegments
// };

// const myExtrude = new ExtrudeGeometry(shape, extrudeSettings);

const outline = new Shape(
  [
    [-2, -0.1],
    [2, -0.1],
    [2, 0.6],
    [1.6, 0.6],
    [1.6, 0.1],
    [-2, 0.1],
  ].map(p => new Vector2(...p))
);

const x = -2.5;
const y = -5;
const shape:CurvePath<Vector3> = new CurvePath();
const points = [
  [x + 2.5, y + 2.5],
  [x + 2.5, y + 2.5],
  [x + 2, y],
  [x, y],
  [x - 3, y],
  [x - 3, y + 3.5],
  [x - 3, y + 3.5],
  [x - 3, y + 5.5],
  [x - 1.5, y + 7.7],
  [x + 2.5, y + 9.5],
  [x + 6, y + 7.7],
  [x + 8, y + 4.5],
  [x + 8, y + 3.5],
  [x + 8, y + 3.5],
  [x + 8, y],
  [x + 5, y],
  [x + 3.5, y],
  [x + 2.5, y + 2.5],
  [x + 2.5, y + 2.5],
].map(p => new Vector3(...p, 0));
for (let i = 0; i < points.length; i += 3) {
  const [v0, v1, v2, v3] = points.slice(i, i + 4)
  shape.add(new CubicBezierCurve3(v0, v1, v2, v3));
}

const extrudeSettings = {
  steps: 100, // ui: steps
  bevelEnabled: false,
  extrudePath: shape,
};

const myExtrude = new ExtrudeGeometry(outline, extrudeSettings);

export default myExtrude;
