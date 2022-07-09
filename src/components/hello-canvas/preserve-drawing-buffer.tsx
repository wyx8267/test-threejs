import { useEffect, useRef } from "react";
import * as Three from "three";

import "./index.scss";

const state = { x: 0, y: 0, z: 0 };

const PreserveDrawingBuffer = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current === null) {
      return;
    }

    const renderer = new Three.WebGLRenderer({
      canvas: canvasRef.current,
      preserveDrawingBuffer: true,
      alpha: true,
    });
    renderer.autoClearColor = false;

    const camera = new Three.OrthographicCamera(-2, 2, 1, -1, -1, 1);

    const scene = new Three.Scene();
    scene.background = new Three.Color(0xffffff);

    const light = new Three.DirectionalLight(0xffffff, 1);
    light.position.set(-1, 2, 3);
    scene.add(light);

    const geometry = new Three.BoxBufferGeometry(1, 1, 1);
    const base = new Three.Object3D();
    scene.add(base);
    base.scale.set(0.1, 0.1, 0.1);

    const colors = ["#F00", "#FF0", "#0F0", "#0FF", "#00F", "#F0F"];
    const numArr = [-2, 2];
    colors.forEach((color, index) => {
      const material = new Three.MeshPhongMaterial({ color });
      const cube = new Three.Mesh(geometry, material);

      const col = Math.floor(index / numArr.length);
      const row = index % numArr.length;
      let result = [0, 0, 0];
      result[col] = numArr[row];

      cube.position.set(result[0], result[1], result[2]);
      base.add(cube);
    });

    const temp = new Three.Vector3();
    const updatePosition = (x: number, y: number) => {
      if (canvasRef.current === null) {
        return;
      }

      const rect = canvasRef.current.getBoundingClientRect();
      const newX = ((x - rect.left) * canvasRef.current.width) / rect.width;
      const newY = ((y - rect.top) * canvasRef.current.height) / rect.height;
      const resX = (newX / canvasRef.current.width) * 2 - 1;
      const resY = (newY / canvasRef.current.height) * -2 + 1;

      temp.set(resX, resY, 0).unproject(camera);
      state.x = temp.x;
      state.y = temp.y;
    };

    const handleMouseMove = (e: MouseEvent) => {
      updatePosition(e.clientX, e.clientY);
    };
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touche = e.touches[0];
      updatePosition(touche.clientX, touche.clientY);
    };

    canvasRef.current.addEventListener("mousemove", handleMouseMove);
    canvasRef.current.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });

    const render = (time: number) => {
      time = time * 0.001;
      base.position.set(state.x, state.y, state.z);
      base.rotation.x = time;
      base.rotation.y = time * 1.11;
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
      camera.right = width / height;
      camera.left = -camera.right;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
  }, [canvasRef]);

  return <canvas ref={canvasRef} className="full-screen" />;
};

export default PreserveDrawingBuffer;
