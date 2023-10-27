import { Entity } from "@galacean/engine";
import { LottieAnimation } from "@galacean/engine-lottie";


export default function lottieFunc(rootEntity: Entity, lottieEntity: Entity): Entity{

    lottieEntity.transform.setPosition(0, 1.2, 16);
    rootEntity.addChild(lottieEntity);
    const lottie = lottieEntity.getComponent(LottieAnimation);

    if(lottie instanceof LottieAnimation){
        lottieEntity.transform.setScale(0.18, 0.18, 0.18);
        lottie.play();
        setTimeout(() => {
            lottie.pause();
        }, 1000)
    }

    return lottieEntity;
}