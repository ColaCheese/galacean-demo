import { getModelFile } from '../utils';
import * as dat from "dat.gui";
import { SpineAnimation } from "@galacean/engine-spine";
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

function addGUI(cubeMaps: TextureCube[], background: Background) {
    
    const gui = new dat.GUI();
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
        })
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
            solidColor.r / 255,
            solidColor.g / 255,
            solidColor.b / 255,
            solidColor.a,
        ],
    };
    colorGUI = gui.addColor(colorObj, "color").onChange((v) => {
        background.solidColor.set(v[0] / 255, v[1] / 255, v[2] / 255, v[3] / 255);
    });

    const obj = {
        cubeMap: 0,
    };

    const mode = {
        fitMode: 1,
    };

    cubeMapGUI = gui
        .add(obj, "cubeMap", { cubeMap1: 0, cubeMap2: 1 })
        .onChange((v) => {
            // @ts-ignore
            background.sky.material.textureCubeMap = cubeMaps[parseInt(v)];
        });
    fitModeGUI = gui
        .add(mode, "fitMode", { AspectFitWidth: 0, AspectFitHeight: 1, Fill: 2 })
        .onChange((v) => {
            background.textureFillMode = parseInt(v);
        });

    // init
    background.mode = BackgroundMode.Texture;
    hide(colorGUI);
    hide(cubeMapGUI);
    show(fitModeGUI);
}


function loadScene(engine: Engine, background: Background): void {

    engine.resourceManager
        //@ts-ignore
        .load<[TextureCube, TextureCube, Texture2D]>([
            {
                urls: [
                    "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*5w6_Rr6ML6IAAAAAAAAAAAAAARQnAQ",
                    "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*TiT2TbN5cG4AAAAAAAAAAAAAARQnAQ",
                    "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*8GF6Q4LZefUAAAAAAAAAAAAAARQnAQ",
                    "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*D5pdRqUHC3IAAAAAAAAAAAAAARQnAQ",
                    "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*_FooTIp6pNIAAAAAAAAAAAAAARQnAQ",
                    "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*CYGZR7ogZfoAAAAAAAAAAAAAARQnAQ",
                ],
                type: AssetType.TextureCube,
            },
            {
                urls: [
                    "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*Bk5FQKGOir4AAAAAAAAAAAAAARQnAQ",
                    "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*_cPhR7JMDjkAAAAAAAAAAAAAARQnAQ",
                    "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*trqjQp1nOMQAAAAAAAAAAAAAARQnAQ",
                    "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*_RXwRqwMK3EAAAAAAAAAAAAAARQnAQ",
                    "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*q4Q6TroyuXcAAAAAAAAAAAAAARQnAQ",
                    "https://gw.alipayobjects.com/mdn/rms_7c464e/afts/img/A*DP5QTbTSAYgAAAAAAAAAAAAAARQnAQ",
                ],
                type: AssetType.TextureCube,
            },
            {
                url: "https://gw.alipayobjects.com/mdn/rms_2e421e/afts/img/A*BcWiRYM7hroAAAAAAAAAAAAAARQnAQ",
                type: AssetType.Texture2D,
            },
        ])
        .then(([cubeMap1, cubeMap2, texture]) => {
            // 添加天空盒背景
            // background.mode = BackgroundMode.Sky; // 默认纯色背景
            const skyMaterial = (background.sky.material = new SkyBoxMaterial(engine)); // 添加天空盒材质
            skyMaterial.textureCubeMap = cubeMap1; // 设置立方体纹理
            background.sky.mesh = PrimitiveMesh.createCuboid(engine, 2, 2, 2); // 设置天空盒网格
            background.texture = texture;
            return [cubeMap1, cubeMap2];
        })
        .then((cubeMaps) => {
            addGUI(cubeMaps, background);
        });
}

function loadModel(engine: Engine, rootEntity: Entity, model: string): void {

    let atlasPath = getModelFile(model, 'atlas')
    let jsonPath = getModelFile(model, 'json')
    let pngPath = getModelFile(model, 'png')

    engine.resourceManager
        .load({
            urls: [jsonPath, atlasPath, pngPath],
            type: "spine",
        })
        .then((spineEntity: Entity) => {
            spineEntity.transform.setPosition(0, -15, 0);
            rootEntity.addChild(spineEntity);
            const spineAnimation = spineEntity.getComponent(SpineAnimation);
            spineAnimation.state.setAnimation(0, "08_walk", true);
            spineAnimation.scale = 0.05;
        });
}

export { loadScene, loadModel }