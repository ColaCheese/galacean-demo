import * as dat from "dat.gui";
import { OrbitControl } from "@galacean/engine-toolkit-controls";
import { Camera, Logger, Vector3, WebGLEngine } from "@galacean/engine";
import { loadScene, loadModel, loadParticle } from "../core";


Logger.enable();

const gui = new dat.GUI();

export async function createRuntime(): Promise<void> {

	// create engine
	const engine = await WebGLEngine.create({ canvas: "canvas" });

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

	// load scene
	const { background } = scene;
	loadScene(engine, background, gui);

	// load model
	let model = "archer"
	loadModel(engine, rootEntity, model, gui);

	// load particle
	loadParticle(engine, rootEntity);

	engine.run();
}