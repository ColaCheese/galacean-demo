import { Entity } from "@galacean/engine";
import { LottieAnimation } from "@galacean/engine-lottie";


export default function lottieFunc(rootEntity: Entity, lottieEntity: Entity): Entity{

    lottieEntity.transform.setPosition(0, 10, 0);
    rootEntity.addChild(lottieEntity);
    const lottie = lottieEntity.getComponent(LottieAnimation);

    if(lottie instanceof LottieAnimation){
        lottieEntity.transform.setScale(3, 3, 3);
        lottie.play();
    }

    return lottieEntity;
}