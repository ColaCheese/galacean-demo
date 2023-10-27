import * as dat from "dat.gui";
import {
    Engine,
    Background,
    PrimitiveMesh,
    SkyBoxMaterial,
    AssetType,
    TextureCube,
    BackgroundMode
} from "@galacean/engine";


class Scene {

    private engine: Engine;
    private background: Background;
    private gui: dat.GUI;
    private skyMaterial: SkyBoxMaterial;
    private colorGUI: any;
    private colorGUI2: any;
    private cubeMapGUI: any;
    private fitModeGUI: any;

    public constructor(_engine: Engine, _background: Background, _gui: dat.GUI) {
        this.engine = _engine;
        this.background = _background;
        this.gui = _gui;
        this.skyMaterial = (this.background.sky.material = new SkyBoxMaterial(this.engine)); // 添加天空盒材质
    }

    public loadScene(): void {

        this.engine.resourceManager
            //@ts-ignore
            .load<[TextureCube, TextureCube, TextureCube, Texture2D]>([
                {
                    urls: [
                        this.getSceneFileUrl('TextureCube', '1', 'jpeg'),
                        this.getSceneFileUrl('TextureCube', '2', 'jpeg'),
                        this.getSceneFileUrl('TextureCube', '3', 'jpeg'),
                        this.getSceneFileUrl('TextureCube', '4', 'jpeg'),
                        this.getSceneFileUrl('TextureCube', '5', 'jpeg'),
                        this.getSceneFileUrl('TextureCube', '6', 'jpeg'),
                    ],
                    type: AssetType.TextureCube,
                },
                {
                    urls: [
                        this.getSceneFileUrl('TextureCube2', '1', 'jpeg'),
                        this.getSceneFileUrl('TextureCube2', '2', 'jpeg'),
                        this.getSceneFileUrl('TextureCube2', '3', 'jpeg'),
                        this.getSceneFileUrl('TextureCube2', '4', 'jpeg'),
                        this.getSceneFileUrl('TextureCube2', '5', 'jpeg'),
                        this.getSceneFileUrl('TextureCube2', '6', 'jpeg'),
                    ],
                    type: AssetType.TextureCube,
                },
                {
                    url: this.getSceneFileUrl('TextureCube3', 'hdr', 'bin'),
                    type: AssetType.HDR,
                },
                {
                    url: this.getSceneFileUrl('Texture2D', 'Texture2D', 'png'),
                    type: AssetType.Texture2D,
                },
            ])
            .then(([cubeMap1, cubeMap2, cubeMap3, texture]) => {
                // 添加天空盒背景
                // this.background.mode = BackgroundMode.Sky; // 默认纯色背景
                // this.skyMaterial = (this.background.sky.material = new SkyBoxMaterial(this.engine)); // 添加天空盒材质
                this.skyMaterial.texture = cubeMap1; // 设置立方体纹理
                this.background.sky.mesh = PrimitiveMesh.createCuboid(this.engine, 2, 2, 2); // 设置天空盒网格
                this.background.texture = texture;
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
        
        const bgFolder = this.gui.addFolder("背景");
        bgFolder.open();
        bgFolder
            .add(this.background, "mode", {
                Sky: BackgroundMode.Sky,
                SolidColor: BackgroundMode.SolidColor,
                Texture: BackgroundMode.Texture,
            }).name("背景类型")
            .onChange((v) => {
                const mode = (this.background.mode = parseInt(v));
                hide(this.colorGUI);
                hide(this.colorGUI2);
                hide(this.cubeMapGUI);
                hide(this.fitModeGUI);
                switch (mode) {
                    case BackgroundMode.Sky:
                        show(this.cubeMapGUI);
                        break;
                    case BackgroundMode.SolidColor:
                        show(this.colorGUI);
                        show(this.colorGUI2);
                        break;
                    case BackgroundMode.Texture:
                        show(this.fitModeGUI);
                        break;
                }
            });

        const solidColor = this.background.solidColor;
        let colorObj = {
            color: [
                solidColor.r,
                solidColor.g,
                solidColor.b,
            ],
        };
        this.colorGUI = bgFolder.addColor(colorObj, "color").name("颜色").onChange((v) => {
            this.background.solidColor.set(v[0] / 255, v[1] / 255, v[2] / 255, color.a);
        });

        let color = {a: 1};
        this.colorGUI2 = bgFolder.add(color, "a", 0, 1).name("透明度").onChange((v2) => {
            color.a = v2;
            this.background.solidColor.set(colorObj.color[0] / 255, colorObj.color[1] / 255, colorObj.color[2] / 255, color.a);
        });
    
        const obj = {
            cubeMap: 0,
        };
        const mode = {
            fitMode: 1,
        };
        this.cubeMapGUI = bgFolder
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
        this.fitModeGUI = bgFolder
            .add(mode, "fitMode", { AspectFitWidth: 0, AspectFitHeight: 1, Fill: 2 })
            .name("纹理适配模式")
            .onChange((v) => {
                this.background.textureFillMode = parseInt(v);
            });

        // init
        this.background.mode = BackgroundMode.Texture;
        hide(this.colorGUI);
        hide(this.colorGUI2);
        hide(this.cubeMapGUI);
        show(this.fitModeGUI);
    }

    public getSceneFileUrl(modelName: string, fileName: string, fileType: string): string {
        return new URL(`../sceneModels/${modelName}/${fileName}.${fileType}`, import.meta.url).href;
    }

}


export default Scene;