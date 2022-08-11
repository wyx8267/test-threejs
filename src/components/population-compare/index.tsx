import { useEffect, useRef } from "react";
import * as Three from "three";
import { mergeBufferGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import "./index.scss";
import TweenManager from "./tweenManager";

type DataType = (number | undefined)[][];
type ASCData = {
  data: DataType;
  ncols: number;
  nrows: number;
  xllcorner: number;
  yllcorner: number;
  cellsize: number;
  NODATA_value: number;
  max: number;
  min: number;
};
type FileInfo = {
  name: string;
  hueRange: [number, number];
  url?: any;
  file?: ASCData | undefined;
  root?: any;
  elem?: HTMLDivElement;
};

async function loadFile(url: string) {
  const req = await fetch(url);
  return req.text();
}

async function loadData(info: FileInfo) {
  const text = await loadFile(info.url);
  info.file = parseData(text);
}

const parseData = (text: string) => {
  const data: DataType = [];
  const settings: { [key: string]: any } = { data };
  let max: number = 0;
  let min: number = Infinity;
  text.split("\n").forEach(line => {
    const parts = line.trim().split(/\s+/);
    if (parts.length === 2) {
      settings[parts[0]] = parseFloat(parts[1]);
    } else if (parts.length > 2) {
      const values = parts.map(item => {
        const value = parseFloat(item);
        if (value === settings["NODATA_value"]) {
          return undefined;
        }
        max = Math.max(max === undefined ? value : max, value);
        min = Math.min(min === undefined ? value : min, value);
        return value;
      });
      data.push(values);
    }
  });
  return { ...settings, max, min } as ASCData;
};

const mapValues = (data: Array<Array<any>>, fn: Function) => {
  return data.map((row, rowNdx) => {
    return row.map((value, colNdx) => {
      return fn(value, rowNdx, colNdx);
    });
  });
};

const makeDiffFile = (
  baseFile: { data: any },
  otherFile: { data: any },
  compareFn: Function
): ASCData => {
  let min: number = Infinity;
  let max: number = 0;
  const baseData = baseFile.data;
  const otherData = otherFile.data;
  const data = mapValues(
    baseData,
    (base: undefined, rowNdx: number, colNdx: number) => {
      const other = otherData[rowNdx][colNdx];
      if (base === undefined || other === undefined) {
        return undefined;
      }
      const value = compareFn(base, other);
      min = Math.min(min === undefined ? value : min, value);
      max = Math.max(max === undefined ? value : max, value);
      return value;
    }
  );
  return { ...baseFile, min, max, data } as ASCData;
};

function amountGreaterThan(a: number, b: number) {
  return Math.max(a - b, 0);
}

const makeBoxes = (
  file: ASCData,
  hueRange: [number, number],
  fileInfos: FileInfo[],
  scene: Three.Scene
) => {
  const lonHelper = new Three.Object3D();
  scene.add(lonHelper);

  const latHelper = new Three.Object3D();
  lonHelper.add(latHelper);

  const positionHelper = new Three.Object3D();
  positionHelper.position.z = 1;
  latHelper.add(positionHelper);

  const originHelper = new Three.Object3D();
  originHelper.position.z = 0.5;
  positionHelper.add(originHelper);

  const range = file.max - file.min;
  const lonFudge = Math.PI * 0.5;
  const latFudge = Math.PI * -0.135;
  const geometries: Three.BoxGeometry[] = [];
  const color = new Three.Color();
  file?.data?.forEach((row: any[], latIndex: number) => {
    row.forEach((value, lonIndex) => {
      if (dataMissingInAnySet(fileInfos, latIndex, lonIndex)) {
        return;
      }
      const amount = (value - file.min) / range;

      lonHelper.rotation.y =
        Three.MathUtils.degToRad(lonIndex + file.xllcorner) + lonFudge;
      latHelper.rotation.x =
        Three.MathUtils.degToRad(latIndex + file.yllcorner) + latFudge;

      const geometry = new Three.BoxGeometry(1, 1, 1);

      positionHelper.scale.set(
        0.005,
        0.005,
        Three.MathUtils.lerp(0.01, 0.5, amount)
      );
      originHelper.updateWorldMatrix(true, false);
      geometry.applyMatrix4(originHelper.matrixWorld);

      const hue = Three.MathUtils.lerp(...hueRange, amount);
      const saturation = 1;
      const lightness = Three.MathUtils.lerp(0.4, 1, amount);
      color.setHSL(hue, saturation, lightness);
      const rgb = color.toArray().map(value => {
        return value * 255;
      });

      const numVerts = geometry.getAttribute("position").count;
      const itemSize = 3;
      const colors = new Uint8Array(itemSize * numVerts);

      //这里有一个稍微奇葩点的写法，就是使用下划线 _ 来起到参数占位的作用
      colors.forEach((_, index) => {
        colors[index] = rgb[index % 3];
      });

      const normalized = true;
      const colorAttrib = new Three.BufferAttribute(
        colors,
        itemSize,
        normalized
      );
      geometry.setAttribute("color", colorAttrib);

      geometries.push(geometry);
    });
  });
  return mergeBufferGeometries(geometries, false);
};

function dataMissingInAnySet(
  fileInfos: FileInfo[],
  latNdx: number,
  lonNdx: number
) {
  for (const fileInfo of fileInfos) {
    if (fileInfo.file?.data[latNdx][lonNdx] === undefined) {
      return true;
    }
  }
  return false;
}

let renderRequested = false;

const tweenManager = new TweenManager();

const PopulationCompare = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current === null) {
      return;
    }

    const canvas = canvasRef.current;
    const renderer = new Three.WebGLRenderer({ canvas });
    const camera = new Three.PerspectiveCamera(60, 2, 0.1, 10);
    camera.position.z = 2.5;
    const scene = new Three.Scene();
    scene.background = new Three.Color(0x000000);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 1.2;
    controls.maxDistance = 4;
    controls.update();

    const loader = new Three.TextureLoader();
    const texture = loader.load(require("@/assets/imgs/world.jpg"), render);
    const material = new Three.MeshBasicMaterial({ map: texture });
    const geometry = new Three.SphereBufferGeometry(1, 64, 32);
    const earth = new Three.Mesh(geometry, material);
    scene.add(earth);

    const loadAll = async () => {
      const fileInfos: FileInfo[] = [
        {
          name: "men",
          hueRange: [0.7, 0.3],
          url: require("@/assets/data/gpw_v4_014mt_2010.asc"),
        },
        {
          name: "women",
          hueRange: [0.9, 1.1],
          url: require("@/assets/data/gpw_v4_014ft_2010.asc"),
        },
      ];
      await Promise.all(fileInfos.map(loadData));
      const menInfo = fileInfos[0];
      const womenInfo = fileInfos[1];
      const menFile = menInfo.file;
      const womenFile = womenInfo.file;

      fileInfos.push({
        name: ">50% men",
        hueRange: [0.6, 1.1],
        file: makeDiffFile(
          menFile as ASCData,
          womenFile as ASCData,
          (men: number, women: number) => {
            return amountGreaterThan(men, women);
          }
        ),
      });
      fileInfos.push({
        name: ">50% women",
        hueRange: [0.0, 0.4],
        file: makeDiffFile(
          womenFile as ASCData,
          menFile as ASCData,
          (women: number, men: number) => {
            return amountGreaterThan(women, men);
          }
        ),
      });

      const geometries = fileInfos.map(info => {
        return makeBoxes(info.file as ASCData, info.hueRange, fileInfos, scene);
      });

      const baseGeometry = geometries[0];
      baseGeometry.morphAttributes.position = geometries.map(
        (geometry, ndx) => {
          const attribute = geometry.getAttribute("position");
          const name = `target${ndx}`;
          attribute.name = name;
          return attribute;
        }
      );
      baseGeometry.morphAttributes.color = geometries.map((geometry, ndx) => {
        const attribute = geometry.getAttribute("color");
        const name = `target${ndx}`;
        attribute.name = name;
        return attribute;
      });

      const cmaterial = new Three.MeshBasicMaterial({
        vertexColors: true,
      });
      const mesh = new Three.Mesh(baseGeometry, cmaterial);
      scene.add(mesh);

      function showFileInfo(
        fileInfos: FileInfo[],
        fileInfo: FileInfo,
        mesh: Three.Mesh
      ) {
        const targets: Record<number, number> = {};
        const durationInMs = 1000;
        fileInfos.forEach((info, i) => {
          const visible = fileInfo === info;
          // info.root.visible = visible;
          info.elem && (info.elem.className = visible ? "selected" : "");
          targets[i] = visible ? 1 : 0;
        });

        tweenManager
          .createTween(mesh.morphTargetInfluences)
          .to(targets, durationInMs)
          .start();
        requestRenderIfNotRequested();
      }

      const uiElem = document.querySelector("#ui");
      fileInfos.forEach(info => {
        const div = document.createElement("div");
        info.elem = div;
        div.textContent = info.name;
        uiElem?.appendChild(div);
        div.addEventListener("mouseover", () => showFileInfo(fileInfos, info, mesh));
      });
      showFileInfo(fileInfos, fileInfos[0], mesh);
    };
    loadAll();

    function resizeRendererToDisplaySize() {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const needResize = canvas.width !== width || canvas.height !== height;
      if (needResize) {
        renderer.setSize(width, height, false);
      }
      return needResize;
    }

    function render() {
      renderRequested = false;

      if (resizeRendererToDisplaySize()) {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }

      if (tweenManager.update()) {
        requestRenderIfNotRequested();
      }

      controls.update();
      renderer.render(scene, camera);
    }
    render();

    function requestRenderIfNotRequested() {
      if (!renderRequested) {
        renderRequested = true;
        requestAnimationFrame(render);
      }
    }

    controls.addEventListener("change", requestRenderIfNotRequested);
    window.addEventListener("resize", requestRenderIfNotRequested);
    return () => {
      controls.removeEventListener("change", requestRenderIfNotRequested);
      window.removeEventListener("resize", requestRenderIfNotRequested);
    };
  }, [canvasRef, tweenManager]);
  return (
    <>
      <canvas ref={canvasRef} className="full-screen" />
      <div id="ui"></div>
    </>
  );
};

export default PopulationCompare;
