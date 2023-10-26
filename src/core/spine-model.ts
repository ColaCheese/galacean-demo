import * as dat from "dat.gui";
import { Engine, Entity } from "@galacean/engine";
import { SpineAnimation } from "@galacean/engine-spine";
import { getFileUrl, readFile } from "../utils";


class SpineModel {

    private engine: Engine;
    private rootEntity: Entity;
    private path: string;
    private modelList: string[];
    private modelFolder: dat.GUI;
    private guiMap: any;
    private model: string;
    private spineEntity: Entity;
    private skinController: any;
    private actionController: any;

    public constructor(_engine: Engine, _rootEntity: Entity, _path: string, _modelList: string[], _modelFolder: dat.GUI, _guiMap: any) {

        // inilitize the model engine and root entity
        this.engine = _engine;
        this.rootEntity = _rootEntity;

        // the relative path of static files
        this.path = _path;

        // get all the model names through read directory
        this.modelList = _modelList;
        
        // initlize the gui
        this.modelFolder = _modelFolder;
        this.guiMap = _guiMap;

        // other initlization
        this.model = this.modelList[0];
        this.spineEntity  = new Entity(this.engine, undefined);
        this.skinController = null;
        this.actionController = null;
    }

    // the core function to load model through its name
    public loadModelByName(model: string): void {

        let atlasPath = getFileUrl("spine", this.path, model, 'atlas');
        let jsonPath = getFileUrl("spine", this.path, model, 'json');
        let pngPath = getFileUrl("spine", this.path, model, 'png');

        this.engine.resourceManager
            .load({
                urls: [jsonPath, atlasPath, pngPath],
                type: "spine",
            })
            .then((spineEntity: any) => {
                // clear the former spine entity
                this.rootEntity.removeChild(this.spineEntity);
                this.spineEntity.destroy();

                // adjust the position of spine entity
                spineEntity.transform.setPosition(0, -0.4, 16);

                // add spine entity to root entity
                this.rootEntity.addChild(spineEntity);
                this.spineEntity = spineEntity;

                // spine animation component settings
                const spineAnimation = spineEntity.getComponent(SpineAnimation);
                spineAnimation.scale = 0.002;
                const { skeleton, state } = spineAnimation;

                // load model skins and actions
                const {skinList, actionList} = this.loadModelResource(model);

                // apply the model's first skin and action
                skeleton.setSkinByName(skinList[0]);
                state.setAnimation(0, actionList[0], true);
                state.apply(skeleton);

                return {state, skeleton, skinList, actionList}
            })
            .then(({state, skeleton, skinList, actionList}) => {
                this.modelModifyGui(state, skeleton, skinList, actionList);
            });
    }

    // load model resource such as skin and action
    public loadModelResource(model: string): { skinList: any, actionList: string[] }{

        let modelJson = readFile(this.path, model, "json");
        let skinList = modelJson.skins.map((skin: any) => skin.name).slice(1);
        let actionList = Object.keys(modelJson.animations);

        return { skinList, actionList }
    }

    // add select model gui and load the first model
    public modelSelectGui(): void {

        this.guiMap.spineName = this.model;

        this.modelFolder.add(this.guiMap, "spineName", this.modelList).name("模型名称").onChange((v: string) => {
            this.loadModelByName(v);
        });
        this.modelFolder.open();

        this.loadModelByName(this.model);
    }

    // initlize the model skin and action select GUI
    public modelModifyGui(state: any, skeleton: any, skinList: string[], actionList: string[]) {
        
        this.guiMap.spineSkin = skinList[0];
        this.guiMap.spineAction = actionList[0];

        // remove former controllers
        if(this.skinController && this.actionController) {
            this.modelFolder.remove(this.skinController);
            this.modelFolder.remove(this.actionController);
        }

        this.skinController = this.modelFolder.add(this.guiMap, "spineSkin", skinList).name("模型皮肤").onChange((v: string) => {
            skeleton.setSkinByName(v);
            state.apply(skeleton);
        });

        this.actionController = this.modelFolder.add(this.guiMap, "spineAction", actionList).name("模型动作").onChange((v: string) => {
            state.setAnimation(0, v, true);
        });
    }
}


export default SpineModel;