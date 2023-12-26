import { P as ParticleRenderer, j as Vector3, C as Color } from "./index.js";
function particleFunc(rootEntity, resource) {
  const particleEntity = rootEntity.createChild("particle");
  let particles = particleEntity.addComponent(ParticleRenderer);
  particles.maxCount = 200;
  particles.startTimeRandomness = 10;
  particles.lifetime = 4;
  particles.position = new Vector3(0, 15, -20);
  particles.positionRandomness = new Vector3(100, 0, 0);
  particles.velocity = new Vector3(0, -3, 0);
  particles.velocityRandomness = new Vector3(1, 2, 0);
  particles.accelerationRandomness = new Vector3(0, 1, 0);
  particles.velocityRandomness = new Vector3(-1, -1, -1);
  particles.rotateVelocity = 1;
  particles.rotateVelocityRandomness = 1;
  particles.size = 1;
  particles.sizeRandomness = 0.8;
  particles.color = new Color(0.5, 0.5, 0.5);
  particles.colorRandomness = 1;
  particles.isFadeIn = true;
  particles.isFadeOut = true;
  particles.texture = resource;
  particles.start();
  return particleEntity;
}
export { particleFunc as default };
