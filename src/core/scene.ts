import * as dat from "dat.gui";
import {
    Engine,
    Background,
    PrimitiveMesh,
    SkyBoxMaterial,
    AssetType,
    TextureCube,
    BackgroundMode,
    Texture2D,
    Entity
} from "@galacean/engine";
import { getSceneFileUrl } from "../utils";


class Scene {

    private engine: Engine;
    private background: Background;
    private path: string;
    private sceneFolder: dat.GUI;
    private guiMap: any;
    private textureList: string[];
    private textureController: any;
    private fitModeController: any;
    private skyList: string[];
    private skyController: any;
    private colorController: any;
    private colorController2: any;
    private skyMaterial: SkyBoxMaterial;

    private sceneType: any;

    public constructor(_engine: Engine, _background: Background, _path: string, _sceneFolder: dat.GUI, _guiMap: any) {
        this.engine = _engine;
        this.background = _background;
        this.path = _path;
        this.sceneFolder = _sceneFolder;
        this.guiMap = _guiMap;
        this.skyMaterial = (this.background.sky.material = new SkyBoxMaterial(this.engine)); // 添加天空盒材质

        // init
        this.textureList = [];
        this.textureController = null;
        this.fitModeController = null;
        this.skyList = [];
        this.skyController = null;
        this.colorController = null;
        this.colorController2 = null;
        // 1-Sky 2-texture 0-color
        this.sceneType = (this.background.mode = 2);
    }

    // load the list of texture
    public loadTextureList(textureList: string[]): void {
        this.textureList = textureList;
    }

    // load the texture through its name
    public loadTextureByName(texture: string, fitMode: number = 1): void {
        this.background.mode = BackgroundMode.Texture;
        this.background.textureFillMode = fitMode;
        
        let textureSrc = getSceneFileUrl(this.path, "Texture2D", texture, "png");
        this.engine.resourceManager
            .load<Texture2D>({
                url: textureSrc,
                type: AssetType.Texture2D
            })
            .then((texture) => {
                this.background.texture = texture;
            });
    }

    // load the list of sky
    public loadSkyList(skyList: string[]): void {
        this.skyList = skyList;
    }

    // load the texture through its name skyType: six-TextureCube hdr-HDR
    public loadSkyByName(sky: string, skyType: string = 'six'): void {
        this.background.mode = BackgroundMode.Sky;
        this.background.sky.mesh = PrimitiveMesh.createCuboid(this.engine, 2, 2, 2); // 设置天空盒网格

        let skySrcs = [];
        let skySrc = "";
        let load : any;

        if(skyType == 'six') {
            for (let i=1; i<=6; i++) {
                skySrcs.push(getSceneFileUrl(this.path, sky, ''+i, "jpeg"));
            }
            load = {
                urls: skySrcs,
                type: AssetType.TextureCube
            }
        } else {
            skySrc = getSceneFileUrl(this.path, "bin", sky, "bin");
            load = {
                url: skySrc,
                type: AssetType.HDR
            }
        }
        this.engine.resourceManager
            .load<TextureCube>(load)
            .then((cubeMap) => {
                if(skyType == 'hdr') {
                    this.skyMaterial.textureDecodeRGBM = true; // HDR
                } else {
                    this.skyMaterial.textureDecodeRGBM = false;
                }
                this.skyMaterial.texture = cubeMap; // 设置立方体纹理
            });
    }

    // load the color through its name
    public loadColorByName(color: Array<number>): void {
        this.background.mode = BackgroundMode.SolidColor;
        this.background.solidColor.set(color[0] / 255, color[1] / 255, color[2] / 255, color[3]);
    }

    // initlize the texture select GUI
    public textureSelectGui(): void {
        if (this.sceneType === 2) {
            this.guiMap.texture = this.textureList[0];
            this.guiMap.fitMode = 0;
            this.textureController = this.sceneFolder.add(this.guiMap, "texture", this.textureList).name("纹理名称").onChange((v: string) => {
                this.loadTextureByName(this.guiMap.texture, this.guiMap.fitMode);
            })
            this.fitModeController = this.sceneFolder.add(this.guiMap, "fitMode", { AspectFitWidth: 0, AspectFitHeight: 1, Fill: 2 }).name("纹理适配模式").onChange((v: number) => {
                this.loadTextureByName(this.guiMap.texture, this.guiMap.fitMode);
            });
            this.loadTextureByName(this.guiMap.texture, this.guiMap.fitMode);
        } else {
            // remove texture controller
            if(this.textureController) {
                // clear the texture entity
                this.sceneFolder.remove(this.textureController);
                this.textureController = null;
            }
            // remove fitMode controller
            if(this.fitModeController) {
                // clear the fitMode
                this.sceneFolder.remove(this.fitModeController);
                this.fitModeController = null;
            }
        }
    }

    // initlize the sky select GUI
    public skySelectGui(): void {
        if (this.sceneType === 1) {
            this.guiMap.sky = this.skyList[0];
            this.skyController = this.sceneFolder.add(this.guiMap, "sky", this.skyList).name("天空盒名称").onChange((v: string) => {
                this.loadSkyByName(this.guiMap.sky.split('-')[0], this.guiMap.sky.split('-')[1]);
            })
            this.loadSkyByName(this.guiMap.sky.split('-')[0], this.guiMap.sky.split('-')[1]);
        } else {
            // remove sky controller
            if(this.skyController) {
                // clear the sky entity
                this.sceneFolder.remove(this.skyController);
                this.skyController = null;
            }
        }
    }

    // initlize the color select GUI
    public colorSelectGui(): void {
        if (this.sceneType === 0) {
            const solidColor = this.background.solidColor;
            let colorObj = {
                color: [
                    solidColor.r,
                    solidColor.g,
                    solidColor.b,
                ],
            }
            let color = {a: 0.5};
            colorObj.color = [100, 100, 100];
            this.colorController = this.sceneFolder.addColor(colorObj, "color").name("颜色").onChange((v) => {
                colorObj.color = v;
                this.loadColorByName([colorObj.color[0] / 255, colorObj.color[1] / 255, colorObj.color[2] / 255, color.a]);
            });
            this.colorController2 = this.sceneFolder.add(color, "a", 0, 1).name("透明度").onChange((v2) => {
                color.a = v2;
                this.loadColorByName([colorObj.color[0] / 255, colorObj.color[1] / 255, colorObj.color[2] / 255, color.a]);
            });
            this.loadColorByName([colorObj.color[0] / 255, colorObj.color[1] / 255, colorObj.color[2] / 255, color.a]);
        } else {
            // remove color controller
            if(this.colorController) {
                // clear the color entity
                this.sceneFolder.remove(this.colorController);
                this.colorController = null;
            }
            // remove color controller
            if(this.colorController2) {
                // clear the color entity
                this.sceneFolder.remove(this.colorController2);
                this.colorController2 = null;
            }
        }
    }

    public sceneSelectGui() : void {
        this.sceneFolder
            .add(this.background, "mode", {
                Sky: BackgroundMode.Sky,
                SolidColor: BackgroundMode.SolidColor,
                Texture: BackgroundMode.Texture,
            }).name("背景类型")
            .onChange((v) => {
                this.sceneType = (this.background.mode = parseInt(v));
                this.textureSelectGui();
                this.skySelectGui();
                this.colorSelectGui();
            });
            this.textureSelectGui();
            this.skySelectGui();
            this.colorSelectGui();
    }
}


export default Scene;