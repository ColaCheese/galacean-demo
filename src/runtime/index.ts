import * as dat from "dat.gui";
import { OrbitControl } from "@galacean/engine-toolkit-controls";
import { Camera, Logger, Vector3, WebGLEngine } from "@galacean/engine";
import { Model, loadScene, loadParticle, Scene } from "../core";


Logger.enable();

const gui = new dat.GUI();

// path: static files relative path (root),
// modelList: model name list,
// canvas: canvas id
export async function createRuntime(canvas: string = "canvas", path: string, modelList: string[]): Promise<void> {

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
	const model = new Model(engine, rootEntity, path, modelList);
	model.modelSelectGui();

	// 1. load scene - common
	// const { background } = scene;
	// loadScene(engine, background, gui);

	// 2. load scene - class
	const { background } = scene;
	const scenec = new Scene(engine, background, gui);
	scenec.loadScene();

	// load particle
	loadParticle(engine, rootEntity);

	engine.run();
}