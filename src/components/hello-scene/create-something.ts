import { Mesh, MeshPhongMaterial, Object3D, PointLight, SphereBufferGeometry } from "three";

const sphere = new SphereBufferGeometry(1, 6, 6);

// sun
const sunMaterial = new MeshPhongMaterial({ emissive: 0xffff00 });
const sunMesh = new Mesh(sphere, sunMaterial);
sunMesh.scale.set(4, 4, 4);

// earth
const earthMaterial = new MeshPhongMaterial({
  color: 0x2233ff,
  emissive: 0x112244,
});
const earthMesh = new Mesh(sphere, earthMaterial);

// moon
const moonMaterial = new MeshPhongMaterial({
  color: 0x888888,
  emissive: 0x222222,
});
const moonMesh = new Mesh(sphere, moonMaterial);
moonMesh.scale.set(0.5, 0.5, 0.5);

// moon track space
const moonOribit = new Object3D()
moonOribit.position.x = 2;
moonOribit.add(moonMesh)

// earth track space
const earthOribit = new Object3D()
earthOribit.position.x = 10;
earthOribit.add(earthMesh)
earthOribit.add(moonOribit)

// sun space
const solarSystem = new Object3D()
solarSystem.add(sunMesh)
solarSystem.add(earthOribit)

// light
const pointLight = new PointLight(0xffffff, 2)

export { moonOribit, earthOribit, solarSystem, pointLight };