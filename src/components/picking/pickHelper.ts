import * as Three from "three";

class PickHelper {
  raycaster: Three.Raycaster;
  pickedObject: any | undefined;
  pickedObjectSavedColor: number;
  constructor() {
    this.raycaster = new Three.Raycaster();
    this.pickedObject = undefined;
    this.pickedObjectSavedColor = 0;
  }

  pick(
    normalizedPosition: { x: number; y: number },
    scene: Three.Scene,
    camera: Three.Camera,
    time: number
  ) {
    if (this.pickedObject) {
      this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
      this.pickedObject = undefined;
    }

    this.raycaster.setFromCamera(normalizedPosition, camera);
    const intersectedObjects = this.raycaster.intersectObjects(scene.children);
    if (intersectedObjects.length) {
      this.pickedObject = intersectedObjects[0].object;
      this.pickedObjectSavedColor =
      this.pickedObject?.material.emissive.getHex();
      this.pickedObject.material.emissive.setHex(
        (time * 8) % 2 > 1 ? 0xffff00 : 0xff0000
      );
    }
  }
}

export default PickHelper;
