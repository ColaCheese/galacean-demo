import * as dat from "dat.gui";
import { OrbitControl } from "@galacean/engine-toolkit-controls";

import {
	Camera,
	Logger,
	Vector3,
	WebGLEngine,
	MeshRenderer
} from "@galacean/engine";
import {
	SpineModel,
	GltfModel,
	Item,
	Scene,
} from "../core";

Logger.enable();


// initlize the gui
const gui = new dat.GUI({width: 350});

// define the gui buttons map
const guiMap: {
	spineName: string, // spine model name
	spineSkin: string, // spine model skin
	spineAction: string; // spine model animation
	gltfOn: boolean // turn on/off gltf model
	gltfName: string, // gltf model name
	particleOn: boolean, // turn on/off particle
	particle: string, // particle selector
	lottieOn: boolean, // turn on/off lottie
	lottie: string, // lottie selector
	textOn: boolean, // turn on/off text
	texture: string, // texture selector
	fitMode: any, // fitMode
} = {
	spineName: "",
	spineSkin: "",
	spineAction: "",
	gltfOn: false,
	gltfName: "",
	particleOn: false,
	particle: "",
	lottieOn: false,
	lottie: "",
	textOn: false,
	texture: "",
	fitMode: null,
};

// canvas: canvas id,
// path: static files relative path (root),
// modelList: model name list,
// particleList: particle name list
export async function createRuntime(
	canvas: string = "canvas",
	path: string,
	spineModelList: string[],
	gltfModelList: string[],
	particleList: string[],
	lottieList: string[],
	textureList: string[],
	skyList: string[],
): Promise<void> {

	// create engine
	const engine = await WebGLEngine.create({ canvas: canvas });

	// adapter to screen
	engine.canvas.resizeByClientSize();

	// create root entity of current scene
	const scene = engine.sceneManager.activeScene;
	const rootEntity = scene.createRootEntity();

	// create camera entity
	const cameraEntity = rootEntity.createChild("camera");
	cameraEntity.addComponent(Camera);
	cameraEntity.addComponent(OrbitControl);
	cameraEntity.transform.position = new Vector3(0, 0, 20);

	// load spine model
	const spineModelFolder = gui.addFolder("spine模型");
	const spineModel = new SpineModel(engine, rootEntity, path, spineModelList, spineModelFolder, guiMap);
	spineModel.modelSelectGui();

	// load gltf model
	const gltfModelFolder = gui.addFolder("gltf模型");
	gltfModelFolder.open();
	const gltfModel = new GltfModel(engine, rootEntity, path);
	gltfModel.loadGui(gltfModelList, gltfModelFolder, guiMap);
	gltfModel.modelSelectGui();

	// load item
	const itemFolder = gui.addFolder("元素");
	itemFolder.open();
	const item = new Item(engine, rootEntity, path);
	item.loadGui(itemFolder, guiMap);
	item.loadParticleList(particleList);
	item.loadLottieList(lottieList);
	item.particleSelectGui()
	item.lottieSelectGui();
	item.textOnGui();

	// load scene
	const { background } = scene;
	const sceneFolder = gui.addFolder("背景");
	sceneFolder.open();
	const scenec = new Scene(engine, background, path);
	scenec.loadGui(sceneFolder, guiMap);
	scenec.loadTextureList(textureList);
	scenec.loadSkyList(skyList);
	scenec.sceneSelectGui();
	// scenec.loadTextureByName("Texture2D1", 0);
	// scenec.loadSkyByName("TextureCube", "six");
	// scenec.loadColorByRGBA([200,120,130,0.5]);

	engine.run();
}