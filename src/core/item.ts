import * as dat from "dat.gui";
import { getParticleFileUrl } from "../utils";
import {
    Engine,
    Entity,
    AssetType,
    Texture2D
} from "@galacean/engine";


class Item {

    private engine: Engine;
    private rootEntity: Entity;
    private path: string;
    private particleList: string[];
    private particle: string;
    private gui: dat.GUI;
    private guiMap: { particleOn: boolean, particle: string };
    private particleController: any;
    private particleEntity: Entity;


    public constructor(_engine: Engine, _rootEntity: Entity, _path: string) {

        // inilitize the model engine and root entity
        this.engine = _engine;
        this.rootEntity = _rootEntity;

        // the relative path of static files
        this.path = _path;

        // initlize the gui
        this.gui = new dat.GUI({
            name: "itemGUI",
            width: 200
        });

        // initlize the gui map
        this.guiMap = {
            particle: "",
            particleOn: false
        };

        // other initlization
        this.particleList = [];
        this.particle = "";
        this.particleController = null;
        this.particleEntity  = new Entity(this.engine, undefined)
    }

    // load the list of particle
    public loadParticleList(particleList: string[]): void {
        this.particleList = particleList;
        this.particle = this.particleList[0];
    }

    // load the particle through its name
    public loadParticleByName(particle: string): void {

        let particleSrc = getParticleFileUrl(this.path, particle, "png");

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

    // initlize the particle select GUI
    public particleSelectGui(): void {
        this.gui.add(this.guiMap, "particleOn", false).name("粒子特效开关").onChange((v: boolean) => {
            if (v) {
                this.particleController = this.gui.add(this.guiMap, "particle", this.particleList).name("粒子特效名称").onChange((v: string) => {
                    // clear the former particle entity
                    this.rootEntity.removeChild(this.particleEntity);
                    this.particleEntity.destroy();
                    this.loadParticleByName(v);
                })
            } else {
                // remove particle controller
                if(this.particleController) {
                    this.gui.remove(this.particleController);
                }
            }
        })
    }
}


export default Item;