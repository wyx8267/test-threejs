import { useEffect, useRef } from "react";
import * as Three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const BackgroundTexture: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textureRef = useRef<Three.Texture | null>(null)

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
    
    const textureLoader = new Three.TextureLoader();
    textureLoader.load(require("@/assets/imgs/mapping.jpg"), texture => {
      textureRef.current = texture
      scene.background = textureRef.current
      resizeHandle()
    });

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

      if (textureRef.current) {
        const bgTexture = textureRef.current
        const imgAspect = bgTexture.image.width / bgTexture.image.height
        const resultAspect = imgAspect / canvasAspect

        bgTexture.offset.x = resultAspect > 1 ? (1 - 1 / resultAspect) / 2 : 0
        bgTexture.repeat.x = resultAspect > 1 ? 1 / resultAspect : 1

        bgTexture.offset.y = resultAspect > 1 ? 0: (1 - resultAspect) / 2
        bgTexture.repeat.y = resultAspect > 1 ? 1: resultAspect
      }
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

export default BackgroundTexture;
