import React, { useEffect, useRef } from "react";
import * as Three from "three";
import GPUPickHelper from "./GPUPickHelper";
import PickHelper from "./pickHelper";

const pickPosition = { x: 0, y: 0 };
const pickHelper = new PickHelper();
const gpuPickHelper = new GPUPickHelper();

function rand(min: number, max?: number) {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return min + (max - min) * Math.random();
}

function randomColor() {
  return `hsl(${rand(360) | 0}, ${rand(50, 100) | 0}%, 50%)`;
}

const Picking: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current === null) {
      return;
    }

    const renderer = new Three.WebGLRenderer({ canvas: canvasRef.current });
    const canvas = renderer.domElement;

    const scene = new Three.Scene();
    scene.background = new Three.Color(0xffffff);
    const pickingScene = new Three.Scene();
    pickingScene.background = new Three.Color(0);

    const camera = new Three.PerspectiveCamera(60, 2, 0.1, 200);
    camera.position.z = 30;
    const cameraPole = new Three.Object3D();
    scene.add(cameraPole);
    cameraPole.add(camera);

    const light = new Three.DirectionalLight(0xffffff, 1);
    camera.add(light);

    const geometry = new Three.BoxGeometry(1, 1, 1);
    const loader = new Three.TextureLoader();
    const texture = loader.load(require("@/assets/imgs/frame.png"));

    const idToObject: Record<number, Three.Mesh> = {};
    const numObjects = 100;
    for (let i = 0; i < numObjects; ++i) {
      const id = i + 1;
      const material = new Three.MeshPhongMaterial({
        color: randomColor(),
        map: texture,
        transparent: true,
        side: Three.DoubleSide,
        alphaTest: 0.1,
      });
      const cube = new Three.Mesh(geometry, material);
      scene.add(cube);
      idToObject[id] = cube;
      cube.position.set(rand(-20, 20), rand(-20, 20), rand(-20, 20));
      cube.rotation.set(rand(Math.PI), rand(Math.PI), 0);
      cube.scale.set(rand(3, 6), rand(3, 6), rand(3, 6));

      const pickingMaterial = new Three.MeshPhongMaterial({
        emissive: new Three.Color(id),
        color: new Three.Color(0, 0, 0),
        specular: new Three.Color(0, 0, 0),
        map: texture,
        transparent: true,
        side: Three.DoubleSide,
        alphaTest: 0.5,
        blending: Three.NoBlending,
      });
      const pickingCube = new Three.Mesh(geometry, pickingMaterial);
      pickingScene.add(pickingCube);
      pickingCube.position.copy(cube.position);
      pickingCube.rotation.copy(cube.rotation);
      pickingCube.scale.copy(cube.scale);
    }

    function getCanvasRelativePosition(event: MouseEvent | Touch) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((event.clientX - rect.left) * canvas.width) / rect.width,
        y: ((event.clientY - rect.top) * canvas.height) / rect.height,
      };
    }

    function setPickPosition(event: MouseEvent | Touch) {
      const pos = getCanvasRelativePosition(event);
      // pickPosition.x = (pos.x / canvas.width) * 2 - 1;
      // pickPosition.y = (pos.y / canvas.height) * -2 + 1;
      pickPosition.x = pos.x;
      pickPosition.y = pos.y;
    }

    function clearPickPosition() {
      // 对于触屏，不像鼠标总是能有一个位置坐标，
      // 如果用户不在触摸屏幕，我们希望停止拾取操作。
      // 因此，我们选取一个特别的值，表明什么都没选中
      pickPosition.x = -100000;
      pickPosition.y = -100000;
    }

    clearPickPosition();
    window.addEventListener("mousemove", setPickPosition);
    window.addEventListener("mouseout", clearPickPosition);
    window.addEventListener("mouseleave", clearPickPosition);

    window.addEventListener(
      "touchstart",
      event => {
        // 阻止窗口滚动行为
        event.preventDefault();
        setPickPosition(event.touches[0]);
      },
      { passive: false }
    );

    window.addEventListener("touchmove", event => {
      setPickPosition(event.touches[0]);
    });

    window.addEventListener("touchend", clearPickPosition);

    const render = (time: number) => {
      time *= 0.001;
      cameraPole.rotation.y = time * 0.1;
      gpuPickHelper.pick(pickPosition, pickingScene, camera, time, renderer, idToObject);
      // pickHelper.pick(pickPosition, scene, camera, time);
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

export default Picking;
