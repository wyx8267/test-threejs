import { useRef, useEffect, useState } from "react";
import * as Three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import createScene, { MaterialType } from "./create-scene";
import "./index.scss";

const HelloCamera: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Three.Scene | null>(null);
  const leftViewRef = useRef<HTMLDivElement>(null);
  const rightViewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      canvasRef.current === null ||
      leftViewRef.current === null ||
      rightViewRef.current === null
    ) {
      return;
    }

    const renderer = new Three.WebGLRenderer({
      canvas: canvasRef.current as HTMLCanvasElement,
    });
    const scene = createScene();
    scene.background = new Three.Color(0x000000);
    sceneRef.current = scene;

    const light = new Three.DirectionalLight(0xffffff, 1);
    light.position.set(0, 10, 0);
    light.target.position.set(5, 0, 0);
    scene.add(light);
    scene.add(light.target);

    const leftCamera = new Three.PerspectiveCamera(45, 2, 5, 100);
    leftCamera.position.set(0, 10, 20);

    const helper = new Three.CameraHelper(leftCamera);
    scene.add(helper);

    const leftControls = new OrbitControls(leftCamera, leftViewRef.current);
    leftControls.target.set(0, 5, 0);
    leftControls.update();

    const rightCamera = new Three.PerspectiveCamera(60, 2, 0.1, 200);
    rightCamera.position.set(40, 10, 30);
    rightCamera.lookAt(0, 5, 0);

    const rightControls = new OrbitControls(rightCamera, rightViewRef.current);
    rightControls.target.set(0, 5, 0);
    rightControls.update();

    const setScissorForElement = (div: HTMLDivElement) => {
      if (canvasRef.current === null) {
        return;
      }

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const divRect = div.getBoundingClientRect();

      const right = Math.min(divRect.right, canvasRect.right) - canvasRect.left;
      const left = Math.max(0, divRect.left - canvasRect.left);
      const bottom =
        Math.min(divRect.bottom, canvasRect.bottom) - canvasRect.top;
      const top = Math.max(0, divRect.top - canvasRect.top);
      const width = Math.min(canvasRect.width, right - left);
      const height = Math.min(canvasRect.height, bottom - top);

      const positiveYUpBottom = canvasRect.height - bottom;
      renderer.setScissor(left, positiveYUpBottom, width, height)
      renderer.setViewport(left, positiveYUpBottom, width, height)

      return width / height
    };

    const render = () => {
      if (leftCamera === null || rightCamera === null || sceneRef.current === null) {
        return
      }

      const sceneBackground = sceneRef.current.background as Three.Color

      const leftAspect = setScissorForElement(leftViewRef.current as HTMLDivElement)
      leftCamera.aspect = leftAspect as number
      leftCamera.updateProjectionMatrix()

      helper.update()
      helper.visible = false;

      sceneBackground.set(0x000000)
      renderer.render(sceneRef.current, leftCamera)

      const rightAspect = setScissorForElement(rightViewRef.current as HTMLDivElement)
      rightCamera.aspect = rightAspect as number
      rightCamera.updateProjectionMatrix()

      helper.visible = true;

      sceneBackground.set(0x000000)
      renderer.render(sceneRef.current, rightCamera)

      window.requestAnimationFrame(render);
    };
    window.requestAnimationFrame(render);

    const resizeHandle = () => {
      if (canvasRef.current === null) {
        return;
      }
      renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight, false);
    };

    resizeHandle();
    window.addEventListener("resize", resizeHandle);
    return () => {
      window.removeEventListener("resize", resizeHandle);
    };
  }, [canvasRef]);

  return (
    <div className="full-screen">
      <div className="split">
        <div ref={leftViewRef} style={{border: '1px solid #fff'}}></div>
        <div ref={rightViewRef}></div>
      </div>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default HelloCamera;
