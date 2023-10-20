import * as dat from "dat.gui";
import {
    Engine,
    Entity,
    AssetType,
    Texture2D
} from "@galacean/engine";
import { getFileUrl } from "../utils";
import createText from "../text/text";


class Item {

    private engine: Engine;
    private rootEntity: Entity;
    private path: string;
    private itemFolder: dat.GUI;
    private guiMap: any
    private particleList: string[];
    private particleEntity: Entity;
    private particleController: any;
    private lottieList: string[];
    private lottieEntity: Entity;
    private lottieController: any;
    private textEntity: Entity;

    public constructor(_engine: Engine, _rootEntity: Entity, _path: string, _itemFolder: dat.GUI, _guiMap: any) {

        // inilitize the model engine and root entity
        this.engine = _engine;
        this.rootEntity = _rootEntity;

        // the relative path of static files
        this.path = _path;

        // initlize the gui
        this.itemFolder = _itemFolder;
        this.guiMap = _guiMap;

        // other initlization
        this.particleList = [];
        this.particleEntity  = new Entity(this.engine, undefined);
        this.particleController = null;
        this.lottieList = [];
        this.lottieEntity  = new Entity(this.engine, undefined);
        this.lottieController = null;
        this.textEntity = new Entity(this.engine, undefined);
    }

    // load the list of particle
    public loadParticleList(particleList: string[]): void {
        this.particleList = particleList;
    }

    // load the particle through its name
    public loadParticleByName(particle: string): void {

        let particleSrc = getFileUrl("particle", this.path, particle, "png");

        this.engine.resourceManager
            .load<Texture2D>({
                url: particleSrc,
                type: AssetType.Texture2D
            })
            .then(resource => {
                import(
                    /* @vite-ignore */
                    `../particle/${particle}.ts`
                ).then(entity => {
                    let particleFunc = entity.default;
                    this.particleEntity = particleFunc(this.rootEntity, resource);
                })
                .catch(err => {
                    console.error(err);
                })
            })
    }

    // load the list of lottie
    public loadLottieList(lottieList: string[]): void {
        this.lottieList = lottieList;
    }

    // load the lottie effect through its name
    public async loadLottieByName(lottie: string): Promise<void> {

        let jsonPath = getFileUrl("lottie", this.path, lottie, "json");
        let atlasPath = getFileUrl("lottie", this.path, lottie, "atlas");
        let item = await import(`../lottie/${lottie}.ts`);

        this.engine.resourceManager
            .load<Entity>({
                urls: [
                    jsonPath,
                    atlasPath
                ],
                type: "lottie"
            })
            .then(lottieEntity => {
                let itemFunc = item.default;
                this.lottieEntity = itemFunc(this.rootEntity, lottieEntity);
            })
    }

    public loadText(text: string): void {
        this.textEntity = createText(this.rootEntity, text);
    }

    // initlize the particle select GUI
    public particleSelectGui(): void {

        const particleFolder = this.itemFolder.addFolder("粒子效果");

        particleFolder.add(this.guiMap, "particleOn", false).name("粒子效果开关").onChange((v: boolean) => {
            if (v) {
                this.guiMap.particle = ""
                this.particleController = particleFolder.add(this.guiMap, "particle", this.particleList).name("粒子效果名称").onChange((v: string) => {
                    // clear the former particle entity
                    this.rootEntity.removeChild(this.particleEntity);
                    this.particleEntity.destroy();
                    this.loadParticleByName(v);
                })
            } else {
                // remove particle controller
                if(this.particleController) {
                    // clear the particle entity
                    this.rootEntity.removeChild(this.particleEntity);
                    this.particleEntity.destroy();
                    particleFolder.remove(this.particleController);
                }
            }
        })
    }

    // initlize the lottie select GUI
    public lottieSelectGui(): void {

        const lottieFolder = this.itemFolder.addFolder("lottie效果");

        lottieFolder.add(this.guiMap, "lottieOn", false).name("lottie开关").onChange((v: boolean) => {
            // clear the lottie entity
            this.rootEntity.removeChild(this.lottieEntity);
            this.lottieEntity.destroy();

            if (v) {
                this.guiMap.lottie = ""
                this.lottieController = lottieFolder.add(this.guiMap, "lottie", this.lottieList).name("lottie名称").onChange(async (v: string) => {
                    this.loadLottieByName(v);
                })
            } else {
                // remove lottie controller
                lottieFolder.remove(this.lottieController);
            }
        })
    }

     // initlize the particle select GUI
     public textOnGui(): void {

        const textFolder = this.itemFolder.addFolder("文字效果");

        textFolder.add(this.guiMap, "textOn", false).name("文字开关").onChange((v: boolean) => {
            if (v) {
                this.loadText("Hello World!");
            } else {
                this.rootEntity.removeChild(this.textEntity);
                this.textEntity.destroy();
            }
        })
    }
}


export default Item;