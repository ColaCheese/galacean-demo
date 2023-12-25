import {
    Entity,
    ParticleRenderer,
    Vector3,
    Color,
    ParticleRendererBlendMode
} from "@galacean/engine";


export default function particleFunc(rootEntity: Entity, resource: any): Entity {

    const particleEntity = rootEntity.createChild("particle");

    let particles: ParticleRenderer = particleEntity.addComponent(ParticleRenderer);

    particles.maxCount = 400;
    particles.startTimeRandomness = 5;
    particles.position = new Vector3(0, 5, 0);
    particles.velocity = new Vector3(0, 20, 0);
    particles.velocityRandomness = new Vector3(10, 2, 10);
    particles.acceleration = new Vector3(0, -10, 0);
    particles.accelerationRandomness = new Vector3(2, 4, 5);
    particles.size = 1;
    particles.sizeRandomness = 1;
    particles.color = new Color(0.5, 0.5, 0.5);
    particles.colorRandomness = 1;
    particles.isFadeIn = true;
    particles.isFadeOut = true;
    particles.texture = resource;
    particles.texture = resource;
    particles.blendMode = ParticleRendererBlendMode.Transparent;
    particles.start();

    return particleEntity;
}