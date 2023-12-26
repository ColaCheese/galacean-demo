import { L as LottieAnimation } from "./module.js";
import "./index.js";
function lottieFunc(rootEntity, lottieEntity) {
  lottieEntity.transform.setPosition(0, 1, 16);
  rootEntity.addChild(lottieEntity);
  const lottie = lottieEntity.getComponent(LottieAnimation);
  if (lottie instanceof LottieAnimation) {
    lottieEntity.transform.setScale(0.5, 0.5, 0.5);
    lottie.play();
  }
  return lottieEntity;
}
export { lottieFunc as default };
