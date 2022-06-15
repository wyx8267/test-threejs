import { useEffect, useRef } from "react";
import * as Three from "three";
import {
  moonOribit,
  earthOribit,
  solarSystem,
  pointLight,
} from "./create-something";

const nodeArr = [solarSystem, earthOribit, moonOribit];

const HelloScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Three.WebGLRenderer | null>(null);
  const cameraRef = useRef<Three.PerspectiveCamera | null>(null);
  const sceneRef = useRef<Three.Scene | null>(null);

  const resizeHandle = () => {
    //根据窗口大小变化，重新修改渲染器的视椎
    if (rendererRef.current === null || cameraRef.current === null) {
      return;
    }

    const canvas = rendererRef.current.domElement;
    cameraRef.current.aspect = canvas.clientWidth / canvas.clientHeight;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(canvas.clientWidth, canvas.clientHeight, false);
  };

  useEffect(() => {
    const renderer = new Three.WebGLRenderer({
      canvas: canvasRef.current as HTMLCanvasElement,
    });
    rendererRef.current = renderer;

    const camera = new Three.PerspectiveCamera(40, 2, 0.1, 1000);
    camera.position.set(0, 50, 0);
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const scene = new Three.Scene();
    scene.background = new Three.Color(0x111111);
    sceneRef.current = scene;

    scene.add(solarSystem);
    scene.add(pointLight);

    // nodeArr.forEach(item => {
    //   const axes = new Three.AxesHelper();
    //   const material = axes.material as Three.Material;
    //   material.depthTest = false;
    //   axes.renderOrder = 1; // renderOrder 的该值默认为 0，这里设置为 1 ，目的是为了提高优先级，避免被物体本身给遮盖住
    //   item.add(axes);
    // });

    //创建循环渲染的动画
    const render = (time: number) => {
      time = time * 0.001;
      nodeArr.forEach(item => {
        item.rotation.y = time;
      });
      renderer.render(scene, camera);
      window.requestAnimationFrame(render);
    };
    window.requestAnimationFrame(render);

    resizeHandle();
    window.addEventListener("resize", resizeHandle);
    return () => {
      window.removeEventListener("resize", resizeHandle);
    };
  }, [canvasRef]);

  return <canvas ref={canvasRef} className="full-screen" />;
};

export default HelloScene;
