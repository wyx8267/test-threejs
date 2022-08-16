import React, { useEffect, useRef } from "react";
import * as Three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let renderRequested = false;

function makeLabelCanvas(baseWidth: number, size: number, name: string) {
  const borderSize = 2;
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return;
  const font = `${size}px bold sans-serif`;
  ctx.font = font;
  const textWidth = ctx.measureText(name).width
  const doubleBorderSize = borderSize * 2;
  const width = baseWidth + doubleBorderSize;
  const height = size + doubleBorderSize;
  ctx.canvas.width = width;
  ctx.canvas.height = height;

  ctx.font = font;
  ctx.textBaseline = "middle";
  ctx.textAlign = 'center'
  ctx.fillStyle = "blue";
  ctx.fillRect(0, 0, width, height);

  const scaleFactor = Math.min(1, baseWidth / textWidth)
  ctx.translate(width / 2, height / 2)
  ctx.scale(scaleFactor, 1)
  ctx.fillStyle = "white";
  ctx.fillText(name, borderSize, borderSize);

  return ctx.canvas;
}

const Billboards: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const renderer = new Three.WebGLRenderer({ canvas });

    const scene = new Three.Scene();
    scene.background = new Three.Color(0xffffff);
    const camera = new Three.PerspectiveCamera(60, 2, 0.1, 100);
    camera.position.set(0, 2, 5);
    scene.add(camera);

    function addLight(position: [number, number, number]) {
      const color = 0xffffff;
      const intensity = 1;
      const light = new Three.DirectionalLight(color, intensity);
      light.position.set(...position);
      scene.add(light);
      scene.add(light.target);
    }
    addLight([-3, 1, 1]);
    addLight([2, 1, 0.5]);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 2, 0);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.update();

    const bodyGeometry = new Three.CylinderGeometry(0.4, 0.2, 2, 6);
    const headGeometry = new Three.SphereGeometry(0.32, 12, 5);
    const labelGeometry = new Three.PlaneGeometry(1, 1);
    const bodyRadiusTop = 0.4;
    const bodyHeight = 2;
    const headRadius = bodyRadiusTop * 0.8;

    function makePerson(x: number, labelWidth: number, size: number, name: string, color: string) {
      const canvas = makeLabelCanvas(labelWidth, size, name);
      if (!canvas) return;
      const texture = new Three.CanvasTexture(canvas);
      texture.minFilter = Three.LinearFilter;
      texture.wrapS = Three.ClampToEdgeWrapping;
      texture.wrapT = Three.ClampToEdgeWrapping;

      const labelMaterial = new Three.SpriteMaterial({
        map: texture,
        transparent: true,
      });
      const bodyMaterial = new Three.MeshPhongMaterial({
        color,
        flatShading: true,
      });

      const root = new Three.Object3D();
      root.position.x = x;

      const body = new Three.Mesh(bodyGeometry, bodyMaterial);
      root.add(body);
      body.position.y = bodyHeight / 2;

      const head = new Three.Mesh(headGeometry, bodyMaterial);
      root.add(head);
      head.position.y = bodyHeight + headRadius * 1.1;

      const labelBaseScale = 0.01;
      const label = new Three.Sprite(labelMaterial);
      root.add(label);
      label.position.y = head.position.y + headRadius + size * labelBaseScale;

      label.scale.x = canvas.width * labelBaseScale;
      label.scale.y = canvas.height * labelBaseScale;

      scene.add(root);
      return root;
    }

    makePerson(-3, 150, 32, "Purple People Eater", "purple");
    makePerson(-0, 150, 32, "Green Machine", "green");
    makePerson(+3, 150, 32, "Red Menace", "red");

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
      time *= 0.001;

      if (resizeRendererToDisplaySize()) {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }

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

  return <canvas ref={canvasRef} className="full-screen" />;
};

export default Billboards;
