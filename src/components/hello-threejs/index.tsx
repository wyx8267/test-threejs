import React, { useEffect, useRef } from "react";
import {
  BoxGeometry,
  DirectionalLight,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import "./index.scss";

const HelloThreejs: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resizeHandleRef = useRef<() => void>();
  const observerRef = useRef<ResizeObserver>();

  useEffect(() => {
    if (canvasRef.current) {
      const renderer = new WebGLRenderer({ canvas: canvasRef.current });
      const camera = new PerspectiveCamera(75, 2, 0.1, 5);

      const scene = new Scene();
      const geometry = new BoxGeometry(1, 1, 1);

      // const material = new MeshBasicMaterial({color: 0x44aa88})
      // const material = new MeshPhongMaterial({ color: 0x44aa88 })

      const material1 = new MeshPhongMaterial({ color: 0x39c5bb });
      const material2 = new MeshPhongMaterial({ color: 0x69c977 });
      const material3 = new MeshPhongMaterial({ color: 0x99cc33 });

      const cube1 = new Mesh(geometry, material1);
      cube1.position.x = -2;
      scene.add(cube1);

      const cube2 = new Mesh(geometry, material2);
      cube2.position.x = 0;
      scene.add(cube2);

      const cube3 = new Mesh(geometry, material3);
      cube3.position.x = 2;
      scene.add(cube3);

      const light = new DirectionalLight(0xffffff, 1);
      light.position.set(-1, 2, 4);
      scene.add(light);

      camera.position.z = 2;

      // renderer.render(scene, camera)

      const cubes = [cube1, cube2, cube3];

      const render = (time: number) => {
        time = time * 0.001;

        // cube.rotation.x = time;
        // cube.rotation.y = time;
        cubes.map(cube => {
          cube.rotation.x = time;
          cube.rotation.y = time;
        });
        renderer.render(scene, camera);
        window.requestAnimationFrame(render);
      };
      window.requestAnimationFrame(render);

      const handleResize = () => {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
      };

      handleResize();

      resizeHandleRef.current = handleResize;
      window.addEventListener("resize", handleResize);

      observerRef.current = new ResizeObserver(() => {
        handleResize()
      })
      observerRef.current.observe(canvasRef.current)
    }

    return () => {
      // if (resizeHandleRef && resizeHandleRef.current) {
      //   window.removeEventListener("resize", resizeHandleRef.current);
      // }
      if (observerRef && observerRef.current) {
        observerRef.current.disconnect()
      }
    };
  }, [canvasRef]);

  return <canvas ref={canvasRef} className="full-screen" />;
};

export default HelloThreejs;
