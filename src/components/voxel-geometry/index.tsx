import { useEffect, useRef } from "react";
import * as Three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Voxelworld from "./voxelWorld";
import './index.scss'

const randInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min) + min);
};

let renderRequested = false;

const cellSize = 32;
const tileSize = 16;
const tileTextureWidth = 256;
const tileTextureHeight = 64;
const world = new Voxelworld({
  cellSize,
  tileSize,
  tileTextureWidth,
  tileTextureHeight,
});
for (let y = 0; y < cellSize; ++y) {
  for (let z = 0; z < cellSize; ++z) {
    for (let x = 0; x < cellSize; ++x) {
      const height =
        (Math.sin((x / cellSize) * Math.PI * 2) +
          Math.sin((z / cellSize) * Math.PI * 3)) *
          (cellSize / 6) +
        cellSize / 2;
      if (y < height) {
        world.setVoxel(x, y, z, randInt(1, 17));
      }
    }
  }
}

const VoxelExample: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const renderer = new Three.WebGLRenderer({ canvas });

    const scene = new Three.Scene();
    scene.background = new Three.Color(0xffffff);

    const camera = new Three.PerspectiveCamera(75, 2, 0.1, 1000);
    camera.position.set(-cellSize * 0.3, cellSize * 0.8, -cellSize * 0.3);
    scene.add(camera);

    function addLight(x: number, y: number, z: number) {
      const color = 0xffffff;
      const intensity = 1;
      const light = new Three.DirectionalLight(color, intensity);
      light.position.set(x, y, z);
      scene.add(light);
    }
    addLight(-1, 2, 4);
    addLight(1, -1, -2);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.target.set(cellSize / 2, cellSize / 3, cellSize / 2);
    controls.update();

    const loader = new Three.TextureLoader();
    const texture = loader.load(
      require("@/assets/imgs/flourish-cc-by-nc-sa.png")
    );
    texture.magFilter = Three.NearestFilter;
    texture.minFilter = Three.NearestFilter;

    const { positions, normals, uvs, indices } =
      world.generateGeometryDataForCell(0, 0, 0);
    const geometry = new Three.BoxGeometry(1, 1, 1);
    const material = new Three.MeshLambertMaterial({
      map: texture,
      side: Three.DoubleSide,
      alphaTest: 0.1,
      transparent: true,
    });
    const positionNumComponents = 3;
    const normalNumComponents = 3;
    const uvNumComponents = 2;
    geometry.setAttribute(
      "position",
      new Three.BufferAttribute(
        new Float32Array(positions),
        positionNumComponents
      )
    );
    geometry.setAttribute(
      "normal",
      new Three.BufferAttribute(new Float32Array(normals), normalNumComponents)
    );
    geometry.setAttribute(
      "uv",
      new Three.BufferAttribute(new Float32Array(uvs), uvNumComponents)
    );
    geometry.setIndex(indices);
    const mesh = new Three.Mesh(geometry, material);
    scene.add(mesh);

    const resizeRendererToDisplaySize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const needResize = canvas.width !== width || canvas.height !== height;
      if (needResize) {
        renderer.setSize(width, height, false);
      }
      return needResize;
    };

    const render = () => {
      renderRequested = false;

      if (resizeRendererToDisplaySize()) {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }

      controls.update();
      renderer.render(scene, camera);
    };

    const requestRenderIfNotRequested = () => {
      if (!renderRequested) {
        renderRequested = true;
        requestAnimationFrame(render);
      }
    };

    requestAnimationFrame(render);

    controls.addEventListener("change", requestRenderIfNotRequested);
    window.addEventListener("resize", requestRenderIfNotRequested);

    return () => {
      controls.removeEventListener("change", requestRenderIfNotRequested);
      window.removeEventListener("resize", requestRenderIfNotRequested);
    };
  }, [canvasRef]);
  
  return (
    <>
      <canvas ref={canvasRef} className="full-screen"></canvas>
      <div id="ui">
        <div className="tiles">
          <input type="radio" name="voxel" id="voxel1" value="1" />
          <label
            htmlFor="voxel1"
            style={{ backgroundPosition: "-0% -0%" }}
          ></label>
          <input type="radio" name="voxel" id="voxel2" value="2" />
          <label
            htmlFor="voxel2"
            style={{ backgroundPosition: "-100% -0%" }}
          ></label>
          <input type="radio" name="voxel" id="voxel3" value="3" />
          <label
            htmlFor="voxel3"
            style={{ backgroundPosition: "-200% -0%" }}
          ></label>
          <input type="radio" name="voxel" id="voxel4" value="4" />
          <label
            htmlFor="voxel4"
            style={{ backgroundPosition: "-300% -0%" }}
          ></label>
          <input type="radio" name="voxel" id="voxel5" value="5" />
          <label
            htmlFor="voxel5"
            style={{ backgroundPosition: "-400% -0%" }}
          ></label>
          <input type="radio" name="voxel" id="voxel6" value="6" />
          <label
            htmlFor="voxel6"
            style={{ backgroundPosition: "-500% -0%" }}
          ></label>
          <input type="radio" name="voxel" id="voxel7" value="7" />
          <label
            htmlFor="voxel7"
            style={{ backgroundPosition: "-600% -0%" }}
          ></label>
          <input type="radio" name="voxel" id="voxel8" value="8" />
          <label
            htmlFor="voxel8"
            style={{ backgroundPosition: "-700% -0%" }}
          ></label>
        </div>
        <div className="tiles">
          <input type="radio" name="voxel" id="voxel9" value="9" />
          <label
            htmlFor="voxel9"
            style={{ backgroundPosition: "-800% -0%" }}
          ></label>
          <input type="radio" name="voxel" id="voxel10" value="10" />
          <label
            htmlFor="voxel10"
            style={{ backgroundPosition: "-900% -0%" }}
          ></label>
          <input type="radio" name="voxel" id="voxel11" value="11" />
          <label
            htmlFor="voxel11"
            style={{ backgroundPosition: "-1000% -0%" }}
          ></label>
          <input type="radio" name="voxel" id="voxel12" value="12" />
          <label
            htmlFor="voxel12"
            style={{ backgroundPosition: "-1100% -0%" }}
          ></label>
          <input type="radio" name="voxel" id="voxel13" value="13" />
          <label
            htmlFor="voxel13"
            style={{ backgroundPosition: "-1200% -0%" }}
          ></label>
          <input type="radio" name="voxel" id="voxel14" value="14" />
          <label
            htmlFor="voxel14"
            style={{ backgroundPosition: "-1300% -0%" }}
          ></label>
          <input type="radio" name="voxel" id="voxel15" value="15" />
          <label
            htmlFor="voxel15"
            style={{ backgroundPosition: "-1400% -0%" }}
          ></label>
          <input type="radio" name="voxel" id="voxel16" value="16" />
          <label
            htmlFor="voxel16"
            style={{ backgroundPosition: "-1500% -0%" }}
          ></label>
        </div>
      </div>
    </>
  );
};
export default VoxelExample;
