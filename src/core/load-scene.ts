import * as dat from "dat.gui";
import {
    Engine,
    Entity,
    Background,
    PrimitiveMesh,
    SkyBoxMaterial,
    AssetType,
    TextureCube,
    BackgroundMode
} from "@galacean/engine";


function addGUI(cubeMaps: TextureCube[], background: Background, gui: dat.GUI, skyMaterial: SkyBoxMaterial) {
    
    let colorGUI = null;
    let cubeMapGUI = null;
    let fitModeGUI = null;
    function hide(_gui) {
        _gui.__li.style.display = "none";
    }
    function show(_gui) {
        _gui.__li.style.display = "block";
    }
    background.mode = BackgroundMode.Texture;
    
    gui
        .add(background, "mode", {
            Sky: BackgroundMode.Sky,
            SolidColor: BackgroundMode.SolidColor,
            Texture: BackgroundMode.Texture,
        }).name("背景类型")
        .onChange((v) => {
            const mode = (background.mode = parseInt(v));
            hide(colorGUI);
            hide(cubeMapGUI);
            hide(fitModeGUI);
            switch (mode) {
                case BackgroundMode.Sky:
                    show(cubeMapGUI);
                    break;
                case BackgroundMode.SolidColor:
                    show(colorGUI);
                    break;
                case BackgroundMode.Texture:
                    show(fitModeGUI);
                    break;
            }
        });

    const solidColor = background.solidColor;
    let colorObj = {
        color: [
            solidColor.r,
            solidColor.g,
            solidColor.b,
            solidColor.a,
        ],
    };
    colorGUI = gui.addColor(colorObj, "color").name("颜色").onChange((v) => {
        background.solidColor.set(v[0] / 255, v[1] / 255, v[2] / 255, v[3]);
    });

    const obj = {
        cubeMap: 0,
    };

    const mode = {
        fitMode: 1,
    };

    cubeMapGUI = gui
        .add(obj, "cubeMap", { cubeMap1: 0, cubeMap2: 1, cubeMap3: 2})
        .name("立方体纹理")
        .onChange((v) => {
            if(parseInt(v)===2) {
                skyMaterial.textureDecodeRGBM = true; // HDR
            } else {
                skyMaterial.textureDecodeRGBM = false;
            }
            // @ts-ignore
            background.sky.material.texture = cubeMaps[parseInt(v)];
        });
    fitModeGUI = gui
        .add(mode, "fitMode", { AspectFitWidth: 0, AspectFitHeight: 1, Fill: 2 })
        .name("纹理适配模式")
        .onChange((v) => {
            background.textureFillMode = parseInt(v);
        });

    // init
    background.mode = BackgroundMode.Texture;
    hide(colorGUI);
    hide(cubeMapGUI);
    show(fitModeGUI);
}


function getSceneFileUrl(modelName: string, fileName: string, fileType: string): string {
    return new URL(`../sceneModels/${modelName}/${fileName}.${fileType}`, import.meta.url).href;
}


function loadScene(engine: Engine, background: Background, gui: dat.GUI): void {

    const skyMaterial = (background.sky.material = new SkyBoxMaterial(engine)); // 添加天空盒材质
    engine.resourceManager
        //@ts-ignore
        .load<[TextureCube, TextureCube, TextureCube, Texture2D]>([
            {
                urls: [
                    getSceneFileUrl('TextureCube', '1', 'jpeg'),
                    getSceneFileUrl('TextureCube', '2', 'jpeg'),
                    getSceneFileUrl('TextureCube', '3', 'jpeg'),
                    getSceneFileUrl('TextureCube', '4', 'jpeg'),
                    getSceneFileUrl('TextureCube', '5', 'jpeg'),
                    getSceneFileUrl('TextureCube', '6', 'jpeg'),
                ],
                type: AssetType.TextureCube,
            },
            {
                urls: [
                    getSceneFileUrl('TextureCube2', '1', 'jpeg'),
                    getSceneFileUrl('TextureCube2', '2', 'jpeg'),
                    getSceneFileUrl('TextureCube2', '3', 'jpeg'),
                    getSceneFileUrl('TextureCube2', '4', 'jpeg'),
                    getSceneFileUrl('TextureCube2', '5', 'jpeg'),
                    getSceneFileUrl('TextureCube2', '6', 'jpeg'),
                ],
                type: AssetType.TextureCube,
            },
            {
                url: getSceneFileUrl('TextureCube3', 'hdr', 'bin'),
                type: AssetType.HDR,
            },
            {
                url: getSceneFileUrl('Texture2D', 'Texture2D', 'png'),
                type: AssetType.Texture2D,
            },
        ])
        .then(([cubeMap1, cubeMap2, cubeMap3, texture]) => {
            // 添加天空盒背景
            // background.mode = BackgroundMode.Sky; // 默认纯色背景
            // const skyMaterial = (background.sky.material = new SkyBoxMaterial(engine)); // 添加天空盒材质
            skyMaterial.texture = cubeMap1; // 设置立方体纹理
            background.sky.mesh = PrimitiveMesh.createCuboid(engine, 2, 2, 2); // 设置天空盒网格
            background.texture = texture;
            return [cubeMap1, cubeMap2, cubeMap3];
        })
        .then((cubeMaps) => {
            addGUI(cubeMaps, background, gui, skyMaterial);
        });
}


export { loadScene }