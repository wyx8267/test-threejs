import * as Three from "three";

class GPUPickHelper {
  pickedObject: any | undefined;
  pickedObjectSavedColor: number;
  pickingTexture: Three.WebGLRenderTarget;
  pixelBuffer: Uint8Array;
  constructor() {
    this.pickingTexture = new Three.WebGLRenderTarget(1, 1);
    this.pixelBuffer = new Uint8Array(4);
    this.pickedObject = undefined;
    this.pickedObjectSavedColor = 0;
  }

  pick(
    cssPosition: { x: number; y: number },
    scene: Three.Scene,
    camera: Three.PerspectiveCamera,
    time: number,
    renderer: Three.WebGLRenderer,
    idToObject: Record<number, Three.Mesh>
  ) {
    const { pickingTexture, pixelBuffer } = this;
    if (this.pickedObject) {
      this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
      this.pickedObject = undefined;
    }

    const pixelRatio = renderer.getPixelRatio();
    camera.setViewOffset(
      renderer.getContext().drawingBufferWidth,
      renderer.getContext().drawingBufferHeight,
      (cssPosition.x * pixelRatio) | 0,
      (cssPosition.y * pixelRatio) | 0,
      1,
      1
    );

    renderer.setRenderTarget(pickingTexture);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);

    camera.clearViewOffset();

    renderer.readRenderTargetPixels(pickingTexture, 0, 0, 1, 1, pixelBuffer);

    const id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | pixelBuffer[2];
    const intersectedObject = idToObject[id];
    if (intersectedObject) {
      this.pickedObject = intersectedObject;
      this.pickedObjectSavedColor =
        this.pickedObject?.material.emissive.getHex();
      this.pickedObject.material.emissive.setHex(
        (time * 8) % 2 > 1 ? 0xffff00 : 0xff0000
      );
    }
  }
}

export default GPUPickHelper;
