import { OrbitControl } from "@galacean/engine-toolkit-controls";
import {
	Camera,
	Logger,
	Vector3,
	WebGLEngine,
} from "@galacean/engine";
import {
	GltfModel,
	Item,
	Scene,
} from "../core";

Logger.enable();

// canvas: canvas id,
// path: static files relative path (root),
// modelList: model name list,
// particleList: particle name list
export async function createNewYearService(
	canvas: string = "canvas",
	path: string,
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
	cameraEntity.transform.position = new Vector3(0, 0, 30);


	// load gltf model
	const gltfModel = new GltfModel(engine, rootEntity, path);
    gltfModel.loadModelByName("lion");

	// load particle
	const item = new Item(engine, rootEntity, path);
	item.loadParticleByName("red");
	item.loadLottieByName("logo");

	// load scene
	const { background } = scene;
	const scenec = new Scene(engine, background, path);
	scenec.loadColorByRGBA([0, 0, 0, 0]);

	engine.run();
}