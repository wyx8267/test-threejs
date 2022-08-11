import { useEffect, useRef } from "react";
import * as Three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const SkyBox: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current === null) {
      return;
    }

    const renderer = new Three.WebGLRenderer({
      canvas: canvasRef.current as HTMLCanvasElement,
    });
    const camera = new Three.PerspectiveCamera(40, 2, 0.1, 1000);
    camera.position.set(0, 0, 40);

    const controls = new OrbitControls(camera, canvasRef.current);
    controls.target.set(0, 5, 0);
    controls.update();

    const scene = new Three.Scene();
    
    // 1
    // const loader = new Three.CubeTextureLoader();
    // const texture = loader.load([
    //   require('@/assets/imgs/pos-x.jpg'),
    //   require('@/assets/imgs/neg-x.jpg'),
    //   require('@/assets/imgs/pos-y.jpg'),
    //   require('@/assets/imgs/neg-y.jpg'),
    //   require('@/assets/imgs/pos-z.jpg'),
    //   require('@/assets/imgs/neg-z.jpg'),
    // ])
    // scene.background = texture

    // 2
    const loader = new Three.TextureLoader();
    loader.load(
      require('@/assets/imgs/tears_of_steel_bridge.jpg'),
      texture => {
        const rt = new Three.WebGLCubeRenderTarget(texture.image.height)
        rt.fromEquirectangularTexture(renderer, texture)
        scene.background = rt.texture
      })

    const light = new Three.HemisphereLight(0xFFFFFF, 0x333333, 1)
    scene.add(light)

    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      "./models/duck.gltf",
      group => {
        console.log("group===>", group);
        const gltf = group.scene;
        scene.add(gltf);
      });

    const render = () => {
      renderer.render(scene, camera);
      window.requestAnimationFrame(render);
    };
    window.requestAnimationFrame(render);

    const resizeHandle = () => {
      const canvas = renderer.domElement;
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      const canvasAspect = w / h
      camera.aspect = canvasAspect;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    resizeHandle();
    window.addEventListener("resize", resizeHandle);
    return () => {
      window.removeEventListener("resize", resizeHandle);
    };
  }, [canvasRef]);

  return <canvas ref={canvasRef} className="full-screen" />;
};

export default SkyBox;
