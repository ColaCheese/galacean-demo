import * as dat from "dat.gui";
import { getModelFileUrl, readFile } from "../utils";
import { SpineAnimation } from "@galacean/engine-spine";
import { Engine, Entity } from "@galacean/engine";


class Model {

    private engine: Engine;
    private rootEntity: Entity;
    private spineEntity: Entity;
    private path: string;
    private modelList: string[];
    private model: string;
    private gui: dat.GUI;
    private guiMap: { name: string, skin: string, action: string; };
    private skinController: any;
    private actionController: any;


    public constructor(_engine: Engine, _rootEntity: Entity, _path: string, _modelList: string[]) {

        // inilitize the model engine and root entity
        this.engine = _engine;
        this.rootEntity = _rootEntity;

        // the relative path of static files
        this.path = _path;

        // get all the model names through read directory
        this.modelList = _modelList;
        
        // initlize the model to the first of model list
        this.model = this.modelList[0];

        // initlize the gui
        this.gui = new dat.GUI({
            name: "modelGUI",
            width: 350
        });

        // initlize the gui map
        this.guiMap = {
            name: "",
            skin: "",
            action: ""
        };

        // other initlization
        this.spineEntity  = new Entity(this.engine, undefined)
        this.skinController = null;
        this.actionController = null;
    }

    // the core function to load model through its name
    public loadModelByName(model: string): void {

        let atlasPath = getModelFileUrl(this.path, model, 'atlas');
        let jsonPath = getModelFileUrl(this.path, model, 'json');
        let pngPath = getModelFileUrl(this.path, model, 'png');

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
                spineEntity.transform.setPosition(0, -20, 0);

                // add spine entity to root entity
                this.rootEntity.addChild(spineEntity);
                this.spineEntity = spineEntity;

                // spine animation component settings
                const spineAnimation = spineEntity.getComponent(SpineAnimation);
                spineAnimation.scale = 0.05;
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

        this.guiMap.name = this.model;

        this.gui.add(this.guiMap, "name", this.modelList).name("模型名称").onChange((v: string) => {
            this.loadModelByName(v);
        });

        this.loadModelByName(this.model);
    }

    // initlize the model skin and action select GUI
    public modelModifyGui(state: any, skeleton: any, skinList: string[], actionList: string[]) {
        
        this.guiMap.skin = skinList[0];
        this.guiMap.action = actionList[0];

        // remove former controllers
        if(this.skinController && this.actionController) {
            this.gui.remove(this.skinController);
            this.gui.remove(this.actionController);
        }

        this.skinController = this.gui.add(this.guiMap, "skin", skinList).name("模型皮肤").onChange((v: string) => {
            skeleton.setSkinByName(v);
            state.apply(skeleton);
        });

        this.actionController = this.gui.add(this.guiMap, "action", actionList).name("模型动作").onChange((v: string) => {
            state.setAnimation(0, v, true);
        });
    }
}


export default Model;