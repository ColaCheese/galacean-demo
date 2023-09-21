import * as dat from "dat.gui";
import {
    Engine,
    Entity,
    AssetType,
    Color,
    ParticleRenderer,
    ParticleRendererBlendMode,
    Texture2D,
    Vector3,
} from "@galacean/engine";


function addGUI(particle: ParticleRenderer, particleEntity: Entity) {

    const gui = new dat.GUI({name: "粒子特效开关"});

	gui
        .add(particle, "playOnEnable", true)
        .onChange((v) => {
            if(v){
                particle.start();
            } else{
                particleEntity.destroy();
            }
        });
}

function loadParticle(engine: Engine, rootEntity: Entity){

    const particleEntity = rootEntity.createChild("particle");

    let particle: ParticleRenderer = particleEntity.addComponent(ParticleRenderer);

    const spriteSheet = [
        {
            x: 0,
            y: 0,
            w: 100,
            h: 95,
            offX: 0,
            offY: 0,
            sourceW: 100,
            sourceH: 95,
        },
        {
            x: 100,
            y: 0,
            w: 48,
            h: 46,
            offX: 0,
            offY: 0,
            sourceW: 48,
            sourceH: 46,
        },
        {
            x: 148,
            y: 0,
            w: 97,
            h: 90,
            offX: 0,
            offY: 0,
            sourceW: 97,
            sourceH: 90,
        },
        {
            x: 245,
            y: 0,
            w: 148,
            h: 128,
            offX: 0,
            offY: 0,
            sourceW: 148,
            sourceH: 128,
        },
        {
            x: 393,
            y: 0,
            w: 118,
            h: 249,
            offX: 0,
            offY: 0,
            sourceW: 118,
            sourceH: 249,
        },
        {
            x: 100,
            y: 90,
            w: 124,
            h: 94,
            offX: 0,
            offY: 0,
            sourceW: 124,
            sourceH: 94,
        },
        {
            x: 0,
            y: 184,
            w: 249,
            h: 185,
            offX: 0,
            offY: 0,
            sourceW: 249,
            sourceH: 185,
        },
        {
            x: 0,
            y: 95,
            w: 86,
            h: 83,
            offX: 0,
            offY: 0,
            sourceW: 86,
            sourceH: 83,
        },
    ];

    engine.resourceManager
        .load<Texture2D>({
            url: "https://gw.alipayobjects.com/mdn/rms_d27172/afts/img/A*_oorR5SrpXcAAAAAAAAAAAAAARQnAQ",
            type: AssetType.Texture2D,
        })
        .then((resource) => {
            particle.maxCount = 400;
            particle.startTimeRandomness = 5;
            particle.position = new Vector3(0, 5, 0);
            particle.velocity = new Vector3(0, 20, 0);
            particle.velocityRandomness = new Vector3(10, 2, 10);
            particle.acceleration = new Vector3(0, -10, 0);
            particle.accelerationRandomness = new Vector3(2, 4, 5);
            particle.rotateVelocity = 1;
            particle.rotateVelocityRandomness = 1;
            particle.size = 1;
            particle.sizeRandomness = 1;
            particle.alpha = 1;
            particle.isFadeIn = true;
            particle.isFadeOut = true;
            particle.texture = resource;
            particle.spriteSheet = spriteSheet;
            particle.start();
        })
        .then(() => {
            addGUI(particle, particleEntity);
        });
}


export { loadParticle }