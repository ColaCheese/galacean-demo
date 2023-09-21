import * as dat from "dat.gui";
import { getModelFileUrl } from '../utils';
import { SpineAnimation } from "@galacean/engine-spine";
import { Engine, Entity } from "@galacean/engine";




function loadModel(engine: Engine, rootEntity: Entity, model: string, gui: dat.GUI): void {

    let atlasPath = getModelFileUrl(model, 'atlas')
    let jsonPath = getModelFileUrl(model, 'json')
    let pngPath = getModelFileUrl(model, 'png')

    engine.resourceManager
        .load({
            urls: [jsonPath, atlasPath, pngPath],
            type: "spine",
        })
        .then((spineEntity: Entity) => {
            spineEntity.transform.setPosition(0, -20, 0);
            rootEntity.addChild(spineEntity);
            const spineAnimation = spineEntity.getComponent(SpineAnimation);
            const { skeleton, state, skeletonData } = spineAnimation;
            state.setAnimation(0, "08_walk", true);
            skeleton.setSkinByName("ssr");
            state.apply(skeleton);
            spineAnimation.scale = 0.05;
        });
}


export { loadModel }