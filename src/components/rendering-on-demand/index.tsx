import React, { useEffect, useRef } from "react";
import * as Three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let flag = false;

const RenderingOnDemand: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current === null) {
      return;
    }

    const renderer = new Three.WebGLRenderer({ canvas: canvasRef.current });

    const scene = new Three.Scene();

    const camera = new Three.PerspectiveCamera(45, 2, 1, 100);
    camera.position.z = 20;

    const light = new Three.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 10);
    scene.add(light);

    const colors = ["blue", "red", "green"];
    const boxs: Three.Mesh[] = [];
    colors.forEach((color, index) => {
      const mat = new Three.MeshPhongMaterial({ color });
      const geo = new Three.BoxBufferGeometry(4, 4, 4);
      const mesh = new Three.Mesh(geo, mat);
      mesh.position.x = (index - 1) * 6;
      scene.add(mesh);
      boxs.push(mesh);
    });

    const render = () => {
      flag = false;
      controls.update();
      renderer.render(scene, camera);
    };
    window.requestAnimationFrame(render);

    const handleChange = () => {
      if (flag === false) {
        flag = true
        window.requestAnimationFrame(render);
      }
    }

    const controls = new OrbitControls(camera, canvasRef.current);
    // controls.addEventListener("change", render);
    controls.addEventListener("change", handleChange);
    controls.enableDamping = true;
    controls.update();

    const handleResize = () => {
      if (canvasRef.current === null) {
        return;
      }
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height, false);
      window.requestAnimationFrame(render);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [canvasRef]);

  return <canvas ref={canvasRef} className="full-screen" />;
};

export default RenderingOnDemand;
