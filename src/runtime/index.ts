import * as dat from "dat.gui";
import { OrbitControl } from "@galacean/engine-toolkit-controls";
import { Camera, Logger, Vector3, WebGLEngine } from "@galacean/engine";
import { Model, Item, loadScene } from "../core";


Logger.enable();


// initlize the gui
const gui = new dat.GUI({width: 350});

// define the gui buttons map
const guiMap: {
	name: string, // model name
	skin: string, // model skin
	action: string; // model animation
	particleOn: boolean, // turn on/off particle
	particle: string, // particle selector
	lottieOn: boolean, // turn on/off lottie
	lottie: string, // lottie selector
	textOn: boolean // turn on/off text
} = {
	name: "",
	skin: "",
	action: "",
	particleOn: false,
	particle: "",
	lottieOn: false,
	lottie: "",
	textOn: false
};

// canvas: canvas id,
// path: static files relative path (root),
// modelList: model name list,
// particleList: particle name list
export async function createRuntime(
	canvas: string = "canvas",
	path: string,
	modelList: string[],
	particleList: string[],
	lottieList: string[]
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
	cameraEntity.transform.position = new Vector3(0, 0, 60);

	// load model
	const modelFolder = gui.addFolder("模型");
	const model = new Model(engine, rootEntity, path, modelList, modelFolder, guiMap);
	model.modelSelectGui();

	// load item
	const itemFolder = gui.addFolder("元素");
	const item = new Item(engine, rootEntity, path, itemFolder, guiMap);
	item.loadParticleList(particleList);
	item.loadLottieList(lottieList);
	item.particleSelectGui()
	item.lottieSelectGui();
	item.textOnGui();

	// load scene
	const { background } = scene;
	loadScene(engine, background, gui);

	engine.run();
}