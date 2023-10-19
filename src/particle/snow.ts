import {
    Entity,
    ParticleRenderer,
    Vector3,
    Color
} from "@galacean/engine";


export default function particleFunc(rootEntity: Entity, resource: any): Entity{

    const particleEntity = rootEntity.createChild("particle");

    let particles: ParticleRenderer = particleEntity.addComponent(ParticleRenderer);

    particles.maxCount = 100;
    particles.startTimeRandomness = 10;
    particles.lifetime = 4;
    particles.position = new Vector3(0, 20, 0);
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