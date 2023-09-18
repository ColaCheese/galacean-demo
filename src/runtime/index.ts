import { Camera, Logger, Vector3, WebGLEngine } from "@galacean/engine";
import { loadModel, loadScene } from "../core/load";
import { OrbitControl } from "@galacean/engine-toolkit-controls";

const MODEL_LIST = ["archer", "biggoblin", "dartgoblin", "elevator_columbus", "kinfegoblin", "manager", "pigman", "soldier_new"]

export function createRuntime(): void {

	Logger.enable();

	// Init Engine
	const engine = new WebGLEngine("canvas", {
		alpha: true
	});

	// Adapter to screen
	engine.canvas._webCanvas.addEventListener("onresize", () => {
		engine.canvas.resizeByClientSize();
	});

	// Get root entity of current scene
	const scene = engine.sceneManager.activeScene;
	const { background } = scene;
	const rootEntity = scene.createRootEntity();

	// Init camera
	const cameraEntity = rootEntity.createChild("camera");
	cameraEntity.addComponent(Camera);
	cameraEntity.addComponent(OrbitControl);
	cameraEntity.transform.position = new Vector3(0, 0, 60);

	// Pass engine, scene, root and camera to model
	let model = "archer"
	loadScene(engine, background)
	loadModel(engine, rootEntity, model);

	engine.run();
}
