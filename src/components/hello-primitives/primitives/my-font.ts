import { Mesh, Object3D } from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";

const loadFont: (url: string) => Promise<Font> = url => {
  const loader = new FontLoader();
  return new Promise((resolve, reject: (error: ErrorEvent) => void) => {
    loader.load(url, resolve, undefined, reject);
  });
};

const createText = async (createMaterial: any) => {
  const url = 'https://threejsfundamentals.org/threejs/resources/threejs/fonts/helvetiker_regular.typeface.json';
  const font = await loadFont(url);

  const geometry = new TextGeometry("Mirai", {
    font,
    size: 3.0,
    height: 0.2,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.15,
    bevelSize: 0.3,
    bevelSegments: 5,
  });

  const mesh = new Mesh(geometry, createMaterial());

  geometry.computeBoundingBox();
  geometry.boundingBox?.getCenter(mesh.position).multiplyScalar(-1);

  const text = new Object3D();
  text.add(mesh);

  return text;
};

export default createText;
