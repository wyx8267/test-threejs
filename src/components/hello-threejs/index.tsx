import React, { useEffect, useRef } from "react";
import { BoxGeometry, DirectionalLight, Mesh, MeshBasicMaterial, MeshPhongMaterial, PerspectiveCamera, Scene, WebGLRenderer } from "three";

const HelloThreejs: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const renderer = new WebGLRenderer({ canvas: canvasRef.current });
      const camera = new PerspectiveCamera(75, 2, 0.1, 5);

      const scene = new Scene();
      const geometry = new BoxGeometry(1, 1, 1)

      // const material = new MeshBasicMaterial({color: 0x44aa88})
      const material = new MeshPhongMaterial({ color: 0x44aa88 })
      
      const cube = new Mesh(geometry, material)
      scene.add(cube)

      const light = new DirectionalLight(0xffffff, 1);
      light.position.set(-1, 2, 4)
      scene.add(light)

      camera.position.z = 2

      // renderer.render(scene, camera)

      const render = (time: number) => {
        time = time * 0.001
        cube.rotation.x = time
        cube.rotation.y = time
        renderer.render(scene, camera)
        window.requestAnimationFrame(render)
      }
      window.requestAnimationFrame(render)
    }
  }, [canvasRef]);

  return <canvas ref={canvasRef} />;
};

export default HelloThreejs;
