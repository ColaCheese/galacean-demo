import { Entity } from "@galacean/engine";
import { LottieAnimation } from "@galacean/engine-lottie";


export default function lottieFunc(rootEntity: Entity, lottieEntity: Entity): Entity{

    lottieEntity.transform.setPosition(0, 1, 16);
    rootEntity.addChild(lottieEntity);
    const lottie = lottieEntity.getComponent(LottieAnimation);

    if(lottie instanceof LottieAnimation){
        lottieEntity.transform.setScale(0.5, 0.5, 0.5);
        lottie.play();
    }

    return lottieEntity;
}