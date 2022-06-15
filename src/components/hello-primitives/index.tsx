import React, { useRef, useEffect, useCallback } from "react";
import * as Three from "three";
import "./index.scss";

import myBox from "./primitives/my-box";
import myCircle from "./primitives/my-circle";
import myCone from "./primitives/my-cone";
import myCylinder from "./primitives/my-cylinder";
import myDodecahedron from "./primitives/my-dodecahedron";
import myEdge from "./primitives/my-edge";
import myExtrude from "./primitives/my-extrude";
import createText from "./primitives/my-font";
import myIcosahedron from "./primitives/my-icosahedron";
import myLathe from "./primitives/my-lathe";
import myOctahedron from "./primitives/my-octahedron";
import myParametric from "./primitives/my-parametric";
import myPlane from "./primitives/my-plane";
import myPolyhedron from "./primitives/my-polyhedron";
import myRing from "./primitives/my-ring";
import myShape from "./primitives/my-shape";
import mySphere from "./primitives/my-sphere";
import myTetrahedron from "./primitives/my-tetrahedron";
import myTorus from "./primitives/my-torus";
import myTorusKnot from "./primitives/my-torusknot";
import myTube from "./primitives/my-tube";
import myWireframe from "./primitives/my-wireframe";

const meshArr: (Three.Mesh | Three.LineSegments | Three.Object3D)[] = [];

const HelloPrimitives: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Three.WebGLRenderer | null>(null);
  const cameraRef = useRef<Three.PerspectiveCamera | null>(null);

  const createMaterial = () => {
    const material = new Three.MeshPhongMaterial({ side: Three.DoubleSide });
    const hue = Math.floor(Math.random() * 100) / 100;
    const saturation = 1;
    const luminance = 0.5;

    material.color.setHSL(hue, saturation, luminance);
    return material;
  };

  const createInit = useCallback(async () => {
    if (canvasRef.current === null) {
      return;
    }

    meshArr.length = 0;

    const scene = new Three.Scene();
    scene.background = new Three.Color(0xaaaaaa);

    const camera = new Three.PerspectiveCamera(40, 2, 0.1, 1000);
    camera.position.z = 120;
    cameraRef.current = camera;

    const renderer = new Three.WebGLRenderer({
      canvas: canvasRef.current as HTMLCanvasElement,
    });
    rendererRef.current = renderer;

    const light0 = new Three.DirectionalLight(0xffffff, 1);
    light0.position.set(-1, 2, 4);
    scene.add(light0);

    const light1 = new Three.DirectionalLight(0xffffff, 1);
    light1.position.set(1, -2, -4);
    scene.add(light1);

    const solidPrimitivesArr: Three.BufferGeometry[] = [];
    solidPrimitivesArr.push(
      myBox,
      myCircle,
      myCone,
      myCylinder,
      myDodecahedron,
      myExtrude,
      myIcosahedron,
      myLathe,
      myOctahedron,
      myParametric,
      myPlane,
      myPolyhedron,
      myRing,
      myShape,
      mySphere,
      myTetrahedron,
      myTorus,
      myTorusKnot,
      myTube
    );

    solidPrimitivesArr.forEach(item => {
      const material = createMaterial();
      const mesh = new Three.Mesh(item, material);
      meshArr.push(mesh);
    });

    meshArr.push(await createText(createMaterial));

    const linePrimitivesArr: Three.BufferGeometry[] = [];
    linePrimitivesArr.push(myEdge, myWireframe);
    linePrimitivesArr.forEach(item => {
      const material = createMaterial();
      const mesh = new Three.LineSegments(item, material);
      meshArr.push(mesh);
    });

    const eachRow = 5;
    const spread = 15;

    meshArr.forEach((mesh, index) => {
      const row = Math.floor(index / eachRow);
      const column = index % eachRow;

      mesh.position.x = (column - 2) * spread;
      mesh.position.y = (2 - row) * spread;

      scene.add(mesh);
    });

    const render = (time: number) => {
      time = time * 0.001;
      meshArr.forEach(item => {
        // item.rotation.x = time / 2;
        item.rotation.y = time / 2;
      });

      renderer.render(scene, camera);
      window.requestAnimationFrame(render);
    };
    window.requestAnimationFrame(render);
  }, [canvasRef]);

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
    createInit();
    resizeHandle();
    window.addEventListener("resize", resizeHandle);
    return () => {
      window.removeEventListener("resize", resizeHandle);
    };
  }, [canvasRef, createInit]);

  return <canvas ref={canvasRef} className="full-screen" />;
};

export default HelloPrimitives;
