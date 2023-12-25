import * as dat from "dat.gui";
import {
    Engine,
    Entity,
    GLTFResource,
    Animator,
    Color,
    DirectLight,
} from "@galacean/engine";
import { getFileUrl, readFile } from "../utils";
import { lstat } from "fs";
import { off } from "process";


class GltfModel {

    private engine: Engine;
    private rootEntity: Entity;
    private path: string;
    private modelList: string[];
    private modelFolder: dat.GUI;
    private guiMap: any;
    private model: string;
    private gltfEntity: Entity;
    private gltfController: any;

    public constructor(_engine: Engine, _rootEntity: Entity, _path: string) {

        // inilitize the model engine and root entity
        this.engine = _engine;
        this.rootEntity = _rootEntity;

        // the relative path of static files
        this.path = _path;
        
        this.gltfEntity  = new Entity(this.engine, undefined);
        this.gltfController = null;
    }
    
    // load gui and model list
    public loadGui(_modelList: string[], _modelFolder: dat.GUI, _guiMap: any): void {
        this.modelList = _modelList;
        this.model = this.modelList[0];
        this.modelFolder = _modelFolder;
        this.guiMap = _guiMap;
    }

    // the core function to load model through its name
    public loadModelByName(model: string): void {

        let gltfPath = getFileUrl("gltf", this.path, model, 'gltf');

        this.engine.resourceManager
            .load<GLTFResource>(
                gltfPath
            )
            .then((gltf) => {
                const { animations, materials, defaultSceneRoot } = gltf;

                this.gltfEntity = defaultSceneRoot;
                this.gltfEntity.transform.setPosition(0, -2, 20);
                this.rootEntity.addChild(this.gltfEntity);
                const animator = defaultSceneRoot.getComponent(Animator);

                if(model === "lion") {
                    // set the direct light to make the model brighter
                    let lightEntity = this.rootEntity.createChild("direct_light")
                    let light = lightEntity.addComponent(DirectLight);
                    light.color = new Color(1, 1, 1);
                    light.intensity = 0.8;

                    animator.play(animations?.at(-1).name);
                    materials?.forEach((material) => {
                        material.emissiveColor = new Color(0, 0, 0);
                    })
                } else {
                    animator.play(animations[0].name);
                }

                console.log(this.gltfEntity);
            })
    }


    // add select model gui and load the first model
    public modelSelectGui(): void {
        this.modelFolder.add(this.guiMap, "gltfOn", false).name("gltf模型开关").onChange((v: boolean) => {
            if (v) {
                this.guiMap.gltfName = ""
                this.gltfController = this.modelFolder.add(this.guiMap, "gltfName", this.modelList).name("模型名称").onChange((v: string) => {
                    // clear the former gltf entity
                    this.rootEntity.removeChild(this.gltfEntity);
                    this.loadModelByName(v);
                })
            } else {
                // remove gltf controller
                if(this.gltfController) {
                    // clear the gltf entity
                    this.rootEntity.removeChild(this.gltfEntity);
                    this.modelFolder.remove(this.gltfController);
                }
            }
        })
    }
}


export default GltfModel;