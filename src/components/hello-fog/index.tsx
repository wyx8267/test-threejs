import React, { useEffect, useRef } from "react";
import * as Three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const HelloFog: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current === null) {
      return;
    }
    const renderer = new Three.WebGLRenderer({ canvas: canvasRef.current });

    const scene = new Three.Scene();
    scene.background = new Three.Color(0xadd8e6);
    scene.fog = new Three.Fog(0xadd8e6, 2, 10);
    // scene.fog = new Three.FogExp2(0xadd8e6, 0.8)

    const camera = new Three.PerspectiveCamera(75, 2, 0.1, 50);
    camera.position.z = 2;

    const controls = new OrbitControls(camera, canvasRef.current);
    controls.update();

    const light = new Three.DirectionalLight(0xffffff, 1);
    light.position.set(-1, 2, 4);
    scene.add(light);

    const colors = ["blue", "red", "green"];
    const boxs: Three.Mesh[] = [];
    colors.forEach((color, index) => {
      const mat = new Three.MeshPhongMaterial({ color });
      const geo = new Three.BoxBufferGeometry(1, 1, 1);
      const mesh = new Three.Mesh(geo, mat);
      mesh.position.set((index - 1) * 2, 0, 0);
      scene.add(mesh);
      boxs.push(mesh);
    });

    const redBox = boxs[1].material as Three.MeshPhongMaterial;
    redBox.fog = false;

    const render = (time: number) => {
      time = time * 0.001;

      boxs.map(box => {
        box.rotation.x = time;
        box.rotation.y = time;
      });
      renderer.render(scene, camera);
      window.requestAnimationFrame(render);
    };
    window.requestAnimationFrame(render);

    const handleResize = () => {
      if (canvasRef.current === null) {
        return;
      }
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height, false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [canvasRef]);

  return <canvas ref={canvasRef} className="full-screen" />;
};

export default HelloFog;
