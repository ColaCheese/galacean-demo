import * as dat from "dat.gui";
import { getModelFileUrl, readFile } from "../utils";
import { modelEntity } from "../config/config";
import { SpineAnimation } from "@galacean/engine-spine";
import { Engine, Entity } from "@galacean/engine";


function addModelGUI(skinList: string[], actionList: string[], state: any, skeleton: any) {

    const modelGUI = new dat.GUI({
        name: "模型调整",
        width: 350,
    });

    const modelInfo = {
        modelSkin: skinList[0],
        modelAction: actionList[0]
    }

	modelGUI.add(modelInfo, "modelSkin", skinList).name("模型皮肤").onChange((v: string) => {
        skeleton.setSkinByName(v);
        state.apply(skeleton);
    });

    modelGUI.add(modelInfo, "modelAction", actionList).name("模型动作").onChange((v: string) => {
        state.setAnimation(0, v, true);
    });
}

function loadModel(engine: Engine, rootEntity: Entity, model: string, gui: dat.GUI): void {

    let atlasPath = getModelFileUrl(model, 'atlas');
    let jsonPath = getModelFileUrl(model, 'json');
    let pngPath = getModelFileUrl(model, 'png');
    let modelJson = readFile(model, 'json');

    let skinList = modelJson.skins.map((skin: any) => skin.name).slice(1);
    let actionList = Object.keys(modelJson.animations);
    modelEntity.skinList = skinList;
    modelEntity.actionList = actionList;

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
            state.setAnimation(0, actionList[0], true);
            skeleton.setSkinByName(skinList[0]);
            state.apply(skeleton);
            spineAnimation.scale = 0.05;

            return {state, skeleton}
        })
        .then(({state, skeleton}) => {
            addModelGUI(skinList, actionList, state, skeleton);
        });
}


export { loadModel }