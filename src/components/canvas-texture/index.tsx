import React, { useEffect, useRef } from "react";
import * as Three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let renderRequested = false;

function randInt(min: number, max?: number) {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return (Math.random() * (max - min) + min) | 0;
}

function drawRandomDot(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = `#${randInt(0x1000000).toString(16).padStart(6, '0')}`;
  ctx.beginPath()
  const x = randInt(256)
  const y = randInt(256)
  const radius = randInt(10, 64)
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
}

const CanvasTextureExample: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const renderer = new Three.WebGLRenderer({canvas})
    
    const scene = new Three.Scene()
    const camera = new Three.PerspectiveCamera(60, 2, 0.1, 100)
    camera.position.z = 4
    scene.add(camera)

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 1;
    controls.maxDistance = 4;
    controls.update();

    const ctx = document.createElement('canvas').getContext("2d");
    if (!ctx) return;
    ctx.canvas.width = 256;
    ctx.canvas.height = 256;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const geometry = new Three.BoxGeometry(1, 1, 1)
    const texture = new Three.CanvasTexture(ctx.canvas)
    const material = new Three.MeshBasicMaterial({
      map: texture
    })
    const cube = new Three.Mesh(geometry, material)
    scene.add(cube)
    
    function resizeRendererToDisplaySize() {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const needResize = canvas.width !== width || canvas.height !== height;
      if (needResize) {
        renderer.setSize(width, height, false);
      }
      return needResize;
    }

    function render(time: number) {
      time *= 0.001

      if (resizeRendererToDisplaySize()) {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }

      if (!ctx) return;
      drawRandomDot(ctx)
      texture.needsUpdate = true

      const speed = 0.2
      const rot = time * speed
      cube.rotation.x = rot
      cube.rotation.y = rot

      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }

    function requestRenderIfNotRequested() {
      if (!renderRequested) {
        renderRequested = true;
        requestAnimationFrame(render);
      }
    }

    requestAnimationFrame(render);
    controls.addEventListener("change", requestRenderIfNotRequested);
    window.addEventListener("resize", requestRenderIfNotRequested);

    return () => {
      controls.removeEventListener("change", requestRenderIfNotRequested);
      window.removeEventListener("resize", requestRenderIfNotRequested);
    };
  }, [canvasRef]);

  return <canvas ref={canvasRef} className="full-screen"/>;
};

export default CanvasTextureExample;
