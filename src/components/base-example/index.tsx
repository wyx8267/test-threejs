import { useEffect, useRef } from "react"
import * as Three from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

let renderRequested = false

const BaseExample: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const renderer = new Three.WebGLRenderer({ canvas })
    
    const scene = new Three.Scene()
    scene.background = new Three.Color(0)

    const camera = new Three.PerspectiveCamera(45, 2, 0.1, 100)
    camera.position.z = 5
    scene.add(camera)

    const light = new Three.AmbientLight(0xFFFFFF, 1)
    scene.add(light)

    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true
    controls.enablePan = false
    controls.update()

    const geometry = new Three.BoxGeometry(1, 1, 1)
    const material = new Three.MeshPhongMaterial({
      color: new Three.Color('green')
    })
    const cube = new Three.Mesh(geometry, material)
    scene.add(cube)

    const resizeRendererToDisplaySize = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      const needResize = canvas.width !== width || canvas.height !== height
      if (needResize) {
        renderer.setSize(width, height, false)
      }
      return needResize
    }

    const render = () => {
      renderRequested = false

      if (resizeRendererToDisplaySize()) {
        camera.aspect = canvas.clientWidth / canvas.clientHeight
        camera.updateProjectionMatrix()
      }

      controls.update()
      renderer.render(scene, camera)
      console.log('render===>',performance.now());
    }
    
    const requestRenderIfNotRequested = () => {
      if (!renderRequested) {
        renderRequested = true
        requestAnimationFrame(render)
      }
    }

    requestAnimationFrame(render)

    controls.addEventListener('change', requestRenderIfNotRequested)
    window.addEventListener('resize', requestRenderIfNotRequested)

    return () => {
      controls.removeEventListener('change', requestRenderIfNotRequested)
      window.removeEventListener('resize', requestRenderIfNotRequested)
    }
  }, [canvasRef])
  return <canvas ref={canvasRef} className="full-screen"></canvas>
}
export default BaseExample