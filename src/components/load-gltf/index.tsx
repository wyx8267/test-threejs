import { useRef, useEffect } from "react";
import * as Three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

function frameArea(
  sizeToFitOnScreen: number,
  boxSize: number,
  boxCenter: Three.Vector3,
  camera: Three.PerspectiveCamera
) {
  const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
  const halfFovY = Three.MathUtils.degToRad(camera.fov * 0.5);
  const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
  const direction = new Three.Vector3()
    .subVectors(camera.position, boxCenter)
    .multiply(new Three.Vector3(1, 0, 1))
    .normalize();
  camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));
  camera.near = boxSize / 100;
  camera.far = boxSize * 100;
  camera.updateProjectionMatrix();
  camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
}

function dumpObject(
  obj: any,
  lines: string[] = [],
  isLast = true,
  prefix = ""
) {
  const localPrefix = isLast ? "└─" : "├─";
  lines.push(
    `${prefix}${prefix ? localPrefix : ""}${obj.name || "*no-name*"} [${
      obj.type
    }]`
  );
  const newPrefix = prefix + (isLast ? "  " : "│ ");
  const lastNdx = obj.children.length - 1;
  obj.children.forEach((child: any, ndx: number) => {
    const isLast = ndx === lastNdx;
    dumpObject(child, lines, isLast, newPrefix);
  });
  return lines;
}

const LoadGltf = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Three.Scene | null>(null);

  useEffect(() => {
    const cars = [];
    if (canvasRef.current === null) {
      return;
    }

    const renderer = new Three.WebGLRenderer({
      canvas: canvasRef.current as HTMLCanvasElement,
    });
    const camera = new Three.PerspectiveCamera(45, 2, 0.1, 1000);
    camera.position.set(0, 10, 20);

    const controls = new OrbitControls(camera, canvasRef.current);
    controls.target.set(0, 5, 0);
    controls.update();

    const scene = new Three.Scene();
    sceneRef.current = scene;

    const hemisphereLight = new Three.HemisphereLight(0xffffff, 0x332277, 1);
    scene.add(hemisphereLight);
    // const hemisphereLightHelper = new Three.HemisphereLightHelper(
    //   hemisphereLight,
    //   1000
    // );
    // scene.add(hemisphereLightHelper);

    const directLight = new Three.DirectionalLight(0xffffff, 0.8);
    directLight.position.set(0, 1500, 1000);
    scene.add(directLight);
    scene.add(directLight.target);
    // const directionalLightHelper = new Three.DirectionalLightHelper(
    //   directLight,
    //   500
    // );
    // scene.add(directionalLightHelper);

    // load gltf
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      "./models/scene.gltf",
      group => {
        console.log("group===>", group);
        const gltf = group.scene;
        scene.add(gltf);
        console.log("dumpObject===>", dumpObject(gltf).join("\n"));

        const box = new Three.Box3().setFromObject(gltf);
        const boxSize = box.getSize(new Three.Vector3()).length();
        const boxCenter = box.getCenter(new Three.Vector3());
        frameArea(boxSize * 1.2, boxSize, boxCenter, camera);
        console.log("===>", boxSize, boxCenter);

        const loadedCars = gltf.getObjectByName("Cars");
        const fixes = [
          { prefix: "Car_08", rot: [Math.PI * 0.5, 0, Math.PI * 0.5] },
          { prefix: "CAR_03", rot: [0, Math.PI, 0] },
          { prefix: "Car_04", rot: [0, Math.PI, 0] },
        ];
        gltf.updateMatrixWorld();
        if (loadedCars?.children) {
          for (const car of loadedCars?.children.slice()) {
            const fix = fixes.find(f => car.name.startsWith(f.prefix));
            const obj = new Three.Object3D();
            car.getWorldPosition(obj.position);
            car.position.set(0, 0, 0);
            // @ts-ignore
            const [x, y, z] = fix?.rot;
            car.rotation.set(x, y, z);
            obj.add(car);
            scene.add(obj);
            cars.push(obj);
          }
        }
      },
      event => {
        console.log("event===>", event);
        console.log(
          "loading===>",
          Math.floor((event.loaded * 100) / event.total) + "% loaded"
        );
      },
      error => {
        console.error("error===>", error);
      }
    );

    const render = () => {
      if (sceneRef.current) {
        renderer.render(sceneRef.current, camera);
      }
      window.requestAnimationFrame(render);
    };
    window.requestAnimationFrame(render);

    const resizeHandle = () => {
      const canvas = canvasRef.current;
      if (canvas === null) {
        return;
      }
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    };

    resizeHandle();
    window.addEventListener("resize", resizeHandle);
    return () => {
      window.removeEventListener("resize", resizeHandle);
    };
  }, [canvasRef]);

  return <canvas ref={canvasRef} className="full-screen" />;
};

export default LoadGltf;
