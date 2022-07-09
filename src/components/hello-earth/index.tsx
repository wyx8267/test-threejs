import { useEffect, useRef } from "react";
import * as Three from "three";
import BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

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

const loadDataFile = async (url: string) => {
  const res = await window.fetch(url);
  const text = await res.text();
  return text;
};

const parseData = (text: string) => {
  const data: DataType = [];
  const settings: { [key: string]: any } = { data };
  let max: number = 0;
  let min: number = 99999;
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
        max = Math.max(max, value);
        min = Math.min(min, value);
        return value;
      });
      data.push(values);
    }
  });
  return { ...settings, max, min } as ASCData;
};

const hsl = (h: number, s: number, l: number) => {
  return `hsl(${(h * 360) | 0}, ${(s * 100) | 0}%, ${(l * 100) | 0}%)`;
};

let renderRequested = false;

const HelloEarth = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawData = (ascData: ASCData) => {
    if (canvasRef.current === null) {
      return;
    }
    const ctx = canvasRef.current.getContext("2d");
    if (ctx === null) {
      return;
    }

    const range = ascData.max - ascData.min;
    ctx.canvas.width = ascData.ncols;
    ctx.canvas.height = ascData.nrows;
    ctx.fillStyle = "#444";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ascData.data.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        if (value === undefined) {
          return;
        }
        const amount = (value - ascData.min) / range;
        const hue = 1;
        const saturation = 1;
        const lightness = amount;
        ctx.fillStyle = hsl(hue, saturation, lightness);
        ctx.fillRect(colIndex, rowIndex, 1, 1);
      });
    });
    console.log("ascData===>", ascData);
  };

  const addBoxes = (ascData: ASCData, scene: Three.Scene) => {
    // const geometry = new Three.BoxBufferGeometry(1, 1, 1);
    // geometry.applyMatrix4(new Three.Matrix4().makeTranslation(0, 0, 0.5));

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

    const range = ascData.max - ascData.min;
    const lonFudge = Math.PI * 0.5;
    const latFudge = Math.PI * -0.135;
    const geometries: Three.BoxBufferGeometry[] = []
    const color = new Three.Color()
    ascData.data.forEach((row, latIndex) => {
      row.forEach((value, lonIndex) => {
        if (value === undefined) {
          return;
        }
        const amount = (value - ascData.min) / range;
        // const material = new Three.MeshBasicMaterial();
        // const hue = Three.MathUtils.lerp(0.7, 0.3, amount);
        // const saturation = 1;
        // const lightness = Three.MathUtils.lerp(0.1, 1, amount);
        // material.color.setHSL(hue, saturation, lightness);
        // const mesh = new Three.Mesh(geometry, material);
        // scene.add(mesh);

        lonHelper.rotation.y =
          Three.MathUtils.degToRad(lonIndex + ascData.xllcorner) + lonFudge;
        latHelper.rotation.x =
          Three.MathUtils.degToRad(latIndex + ascData.yllcorner) + latFudge;

        // positionHelper.updateWorldMatrix(true, false);
        // mesh.applyMatrix4(positionHelper.matrixWorld);
        // mesh.scale.set(0.005, 0.005, Three.MathUtils.lerp(0.001, 0.5, amount));

        const geometry = new Three.BoxBufferGeometry(1, 1, 1);

        positionHelper.scale.set(
          0.005,
          0.005,
          Three.MathUtils.lerp(0.01, 0.5, amount)
        );
        originHelper.updateWorldMatrix(true, false);
        geometry.applyMatrix4(originHelper.matrixWorld);

        const hue = Three.MathUtils.lerp(0.7, 0.3, amount);
        const saturation = 1;
        const lightness = Three.MathUtils.lerp(0.1, 1, amount);
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
    const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries)
    //const material = new Three.MeshBasicMaterial({ color: 'red' })
    const material = new Three.MeshBasicMaterial({
        vertexColors: true
    })
    const mesh = new Three.Mesh(mergedGeometry, material)
    scene.add(mesh)
  };

  useEffect(() => {
    if (canvasRef.current === null) {
      return;
    }

    const canvas = canvasRef.current;
    const renderer = new Three.WebGLRenderer({ canvas });
    const camera = new Three.PerspectiveCamera(45, 2, 0.1, 100);
    camera.position.z = 4;
    const scene = new Three.Scene();
    scene.background = new Three.Color(0x000000);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.update();

    const render = () => {
      renderRequested = false;
      controls.update();
      renderer.render(scene, camera);
    };

    const handleChange = () => {
      if (renderRequested === false) {
        renderRequested = true;
        window.requestAnimationFrame(render);
      }
    };

    controls.addEventListener("change", handleChange);

    const loader = new Three.TextureLoader();
    const texture = loader.load(require("@/assets/imgs/world.jpg"), render);
    const material = new Three.MeshBasicMaterial({ map: texture });
    const geometry = new Three.SphereBufferGeometry(1, 64, 32);
    const earth = new Three.Mesh(geometry, material);
    scene.add(earth);

    const handleResize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);

      window.requestAnimationFrame(render);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const ascURL = require("@/assets/data/gpw_v4_014mt_2010.asc");
    const doSomething = async () => {
      try {
        const text = await loadDataFile(ascURL);
        const ascData = parseData(text);
        // drawData(ascData);
        addBoxes(ascData, scene);
      } catch (err) {
        console.error(err);
      }
    };
    doSomething();

    return () => {
      controls.removeEventListener("change", handleChange);
      window.removeEventListener("resize", handleResize);
    };
  }, [canvasRef]);
  return <canvas ref={canvasRef} className="full-screen" />;
};

export default HelloEarth;
