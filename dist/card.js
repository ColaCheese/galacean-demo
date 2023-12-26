import { L as LottieAnimation } from "./module.js";
import "./index.js";
function lottieFunc(rootEntity, lottieEntity) {
  lottieEntity.transform.setPosition(0, 0, 16);
  rootEntity.addChild(lottieEntity);
  const lottie = lottieEntity.getComponent(LottieAnimation);
  if (lottie instanceof LottieAnimation) {
    lottieEntity.transform.setScale(0.2, 0.2, 0.2);
    lottie.play();
  }
  return lottieEntity;
}
export { lottieFunc as default };
