import React, { useEffect, useRef } from "react";
import * as Three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let flag = false;
const d = 0.8;

function hsl(h: number, s: number, l: number) {
  return new Three.Color().setHSL(h, s, l);
}

const boxConfig: { color: Three.Color; pos: [number, number, number] }[] = [
  { color: hsl(0 / 8, 1, 0.5), pos: [-d, -d, -d] },
  { color: hsl(1 / 8, 1, 0.5), pos: [d, -d, -d] },
  { color: hsl(2 / 8, 1, 0.5), pos: [-d, d, -d] },
  { color: hsl(3 / 8, 1, 0.5), pos: [d, d, -d] },
  { color: hsl(4 / 8, 1, 0.5), pos: [-d, -d, d] },
  { color: hsl(5 / 8, 1, 0.5), pos: [d, -d, d] },
  { color: hsl(6 / 8, 1, 0.5), pos: [-d, d, d] },
  { color: hsl(7 / 8, 1, 0.5), pos: [d, d, d] },
];

const planeDataArr = [
  {
    rotation: 0,
    imgsrc: require('@/assets/imgs/tree-01.png')
  },
  {
    rotation: Math.PI * 0.5,
    imgsrc: require('@/assets/imgs/tree-02.png')
  },
]

const TransparentBox: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current === null) {
      return;
    }

    const renderer = new Three.WebGLRenderer({ canvas: canvasRef.current });

    const scene = new Three.Scene();
    scene.background = new Three.Color(0xffffff);

    const camera = new Three.PerspectiveCamera(75, 2, 0.1, 25);
    camera.position.z = 2;

    function addLight(...pos: [number, number, number]) {
      const light = new Three.DirectionalLight(0xffffff, 1);
      light.position.set(...pos);
      scene.add(light);
    }
    addLight(-1, 2, 4);
    addLight(1, -1, -2);

    // const boxs: Three.Mesh[] = [];
    // boxConfig.forEach((item, index) => {
    //   [Three.BackSide, Three.FrontSide].forEach(side => {
    //     const mat = new Three.MeshPhongMaterial({
    //       color: item.color,
    //       opacity: 0.5,
    //       transparent: true,
    //       side,
    //     });
    //     const geo = new Three.BoxBufferGeometry(1, 1, 1);
    //     const mesh = new Three.Mesh(geo, mat);
    //     mesh.position.set(...item.pos);
    //     scene.add(mesh);
    //     boxs.push(mesh);
    //   });
    // });

    planeDataArr.forEach(item => {
      const geometry = new Three.PlaneBufferGeometry(2, 2)
      const textureLoader = new Three.TextureLoader()
      const material = new Three.MeshBasicMaterial({
        map: textureLoader.load(item.imgsrc),
        alphaTest: 0.5,
        transparent: true,
        side: Three.DoubleSide
      })
      const plane = new Three.Mesh(geometry, material)
      plane.rotation.y = item.rotation
      scene.add(plane)
    })

    const render = () => {
      flag = false;
      controls.update();
      renderer.render(scene, camera);
    };
    window.requestAnimationFrame(render);

    const handleChange = () => {
      if (flag === false) {
        flag = true;
        window.requestAnimationFrame(render);
      }
    };

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

export default TransparentBox;
