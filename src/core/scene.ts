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
    private rootEntity: Entity;
    private background: Background;
    private path: string;
    private sceneFolder: dat.GUI;
    private guiMap: any;
    private textureList: string[];
    private textureEntity: Entity;
    private textureController: any;
    private fitModeController: any;
    private skyMaterial: SkyBoxMaterial;
    private colorGUI: any;
    private colorGUI2: any;
    private cubeMapGUI: any;

    private sceneType: any;

    public constructor(_engine: Engine, _rootEntity: Entity, _background: Background, _path: string, _sceneFolder: dat.GUI, _guiMap: any) {
        this.engine = _engine;
        this.rootEntity = _rootEntity;
        this.background = _background;
        this.path = _path;
        this.sceneFolder = _sceneFolder;
        this.guiMap = _guiMap;
        this.skyMaterial = (this.background.sky.material = new SkyBoxMaterial(this.engine)); // 添加天空盒材质

        // init
        this.textureList = [];
        this.textureEntity = new Entity(this.engine, undefined);
        this.textureController = null;
        this.fitModeController = null;
        this.sceneType = null;
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

    // initlize the texture select GUI
    public textureSelectGui(): void {
        
        if (this.sceneType == 2) {
            this.guiMap.texture = "";
            this.guiMap.fitMode = 0;
            this.textureController = this.sceneFolder.add(this.guiMap, "texture", this.textureList).name("纹理名称").onChange((v: string) => {
                // clear the former texture entity
                this.rootEntity.removeChild(this.textureEntity);
                this.textureEntity.destroy();
                this.loadTextureByName(this.guiMap.texture, this.guiMap.fitMode);
            })
            this.fitModeController = this.sceneFolder.add(this.guiMap, "fitMode", { AspectFitWidth: 0, AspectFitHeight: 1, Fill: 2 }).name("纹理适配模式").onChange((v: number) => {
                // clear the former texture entity
                this.rootEntity.removeChild(this.textureEntity);
                this.textureEntity.destroy();
                this.loadTextureByName(this.guiMap.texture, this.guiMap.fitMode);
            });
        } else {
            // remove texture controller
            if(this.textureController) {
                // clear the texture entity
                this.rootEntity.removeChild(this.textureEntity);
                this.textureEntity.destroy();
                this.sceneFolder.remove(this.textureController);
                // clear the fitMode
                this.sceneFolder.remove(this.fitModeController);
            }
        }
    }

    public loadScene(): void {

        this.engine.resourceManager
            //@ts-ignore
            .load<[TextureCube, TextureCube, TextureCube]>([
                {
                    urls: [
                        getSceneFileUrl(this.path, 'TextureCube', '1', 'jpeg'),
                        getSceneFileUrl(this.path, 'TextureCube', '2', 'jpeg'),
                        getSceneFileUrl(this.path, 'TextureCube', '3', 'jpeg'),
                        getSceneFileUrl(this.path, 'TextureCube', '4', 'jpeg'),
                        getSceneFileUrl(this.path, 'TextureCube', '5', 'jpeg'),
                        getSceneFileUrl(this.path, 'TextureCube', '6', 'jpeg'),
                    ],
                    type: AssetType.TextureCube,
                },
                {
                    urls: [
                        getSceneFileUrl(this.path, 'TextureCube2', '1', 'jpeg'),
                        getSceneFileUrl(this.path, 'TextureCube2', '2', 'jpeg'),
                        getSceneFileUrl(this.path, 'TextureCube2', '3', 'jpeg'),
                        getSceneFileUrl(this.path, 'TextureCube2', '4', 'jpeg'),
                        getSceneFileUrl(this.path, 'TextureCube2', '5', 'jpeg'),
                        getSceneFileUrl(this.path, 'TextureCube2', '6', 'jpeg'),
                    ],
                    type: AssetType.TextureCube,
                },
                {
                    url: getSceneFileUrl(this.path, 'TextureCube3', 'hdr', 'bin'),
                    type: AssetType.HDR,
                },
            ])
            .then(([cubeMap1, cubeMap2, cubeMap3]) => {
                this.skyMaterial.texture = cubeMap1; // 设置立方体纹理
                this.background.sky.mesh = PrimitiveMesh.createCuboid(this.engine, 2, 2, 2); // 设置天空盒网格
                return [cubeMap1, cubeMap2, cubeMap3];
            })
            .then((cubeMaps) => {
                this.addGUI(cubeMaps);
            });
    }

    public addGUI(cubeMaps: TextureCube[]) {

        function hide(_gui: any) {
            _gui.__li.style.display = "none";
        }
        function show(_gui: any) {
            _gui.__li.style.display = "block";
        }
        this.background.mode = BackgroundMode.Texture;
        
        this.sceneFolder
            .add(this.background, "mode", {
                Sky: BackgroundMode.Sky,
                SolidColor: BackgroundMode.SolidColor,
                Texture: BackgroundMode.Texture,
            }).name("背景类型")
            .onChange((v) => {
                const mode = (this.background.mode = parseInt(v));
                this.sceneType = mode;
                
                hide(this.colorGUI);
                hide(this.colorGUI2);
                hide(this.cubeMapGUI);
                switch (mode) {
                    case BackgroundMode.Sky:
                        show(this.cubeMapGUI);
                        break;
                    case BackgroundMode.SolidColor:
                        show(this.colorGUI);
                        show(this.colorGUI2);
                        break;
                }
                this.textureSelectGui();
            });

        const solidColor = this.background.solidColor;
        let colorObj = {
            color: [
                solidColor.r,
                solidColor.g,
                solidColor.b,
            ],
        };
        this.colorGUI = this.sceneFolder.addColor(colorObj, "color").name("颜色").onChange((v) => {
            this.background.solidColor.set(v[0] / 255, v[1] / 255, v[2] / 255, color.a);
        });

        let color = {a: 1};
        this.colorGUI2 = this.sceneFolder.add(color, "a", 0, 1).name("透明度").onChange((v2) => {
            color.a = v2;
            this.background.solidColor.set(colorObj.color[0] / 255, colorObj.color[1] / 255, colorObj.color[2] / 255, color.a);
        });
    
        const obj = {
            cubeMap: 0,
        };
        const mode = {
            fitMode: 1,
        };
        this.cubeMapGUI = this.sceneFolder
            .add(obj, "cubeMap", { cubeMap1: 0, cubeMap2: 1, cubeMap3: 2})
            .name("立方体纹理")
            .onChange((v) => {
                if(parseInt(v)===2) {
                    this.skyMaterial.textureDecodeRGBM = true; // HDR
                } else {
                    this.skyMaterial.textureDecodeRGBM = false;
                }
                // @ts-ignore
                this.background.sky.material.texture = cubeMaps[parseInt(v)];
            });

        // init
        this.background.mode = BackgroundMode.Texture;
        hide(this.colorGUI);
        hide(this.colorGUI2);
        hide(this.cubeMapGUI);
    }

}


export default Scene;