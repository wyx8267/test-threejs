import { useRef, useEffect } from "react";
import * as Three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";

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

const LoadObj = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Three.Scene | null>(null);

  useEffect(() => {
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

    const planeSize = 2000;
    const loader = new Three.TextureLoader();
    const texture = loader.load(require("@/assets/imgs/checker.png"));
    texture.wrapS = Three.RepeatWrapping;
    texture.wrapT = Three.RepeatWrapping;
    texture.magFilter = Three.NearestFilter;
    texture.repeat.set(planeSize / 200, planeSize / 200);

    const planeMat = new Three.MeshStandardMaterial({
      map: texture,
      side: Three.DoubleSide,
    });
    const planeGeo = new Three.PlaneBufferGeometry(planeSize, planeSize);
    const planeMesh = new Three.Mesh(planeGeo, planeMat);
    planeMesh.rotation.x = Math.PI * -0.5;
    scene.add(planeMesh);

    // load obj
    const mtlLoader = new MTLLoader()
    mtlLoader.load(
      "./models/windmill-fixed.mtl",
      mtl => {
        mtl.preload()
        const objLoader = new OBJLoader();
        objLoader.setMaterials(mtl)
        objLoader.load(
          "./models/windmill.obj",
          group => {
            console.log("group===>", group);
            group.updateMatrixWorld()
            scene.add(group);
    
            const box = new Three.Box3().setFromObject(group);
            const boxSize = box.getSize(new Three.Vector3()).length();
            const boxCenter = box.getCenter(new Three.Vector3());
            frameArea(boxSize * 1.2, boxSize, boxCenter, camera);
            console.log("===>", boxSize, boxCenter);
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
      }
    )

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

export default LoadObj;
