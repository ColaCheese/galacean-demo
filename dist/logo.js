import { L as LottieAnimation } from "./module.js";
import "./index.js";
function lottieFunc(rootEntity, lottieEntity) {
  lottieEntity.transform.setPosition(0, 2, 16);
  rootEntity.addChild(lottieEntity);
  const lottie = lottieEntity.getComponent(LottieAnimation);
  if (lottie instanceof LottieAnimation) {
    lottieEntity.transform.setScale(0.8, 0.8, 0.8);
    lottie.play();
    setTimeout(() => {
      lottie.pause();
    }, 1e3);
  }
  return lottieEntity;
}
export { lottieFunc as default };
