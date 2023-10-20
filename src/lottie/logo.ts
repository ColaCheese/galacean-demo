import { Entity } from "@galacean/engine";
import { LottieAnimation } from "@galacean/engine-lottie";


export default function lottieFunc(rootEntity: Entity, lottieEntity: Entity): Entity{

    lottieEntity.transform.setPosition(0, 15, 0);
    rootEntity.addChild(lottieEntity);
    const lottie = lottieEntity.getComponent(LottieAnimation);

    if(lottie instanceof LottieAnimation){
        lottie.isLooping = true;
        lottieEntity.transform.setScale(2.5, 2.5, 2.5);
        lottie.play();
    }

    return lottieEntity;
}