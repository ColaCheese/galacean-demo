<script setup lang="ts">
import { onMounted } from "vue";
import { createRuntime } from "./runtime";
import { createNewYearService } from "./service/new-year";
import { Player } from '@galacean/effects';


onMounted(() => {
  createRuntime(
    "canvas",
    "./src/assets",
    [
      "archer",
      "biggoblin",
      "columbus",
      "kinfegoblin",
      "manager",
      "pigman",
      "soldier",
      "test"
    ],
    [
      "earth"
    ],
    [
      "food",
      "snow"
    ],
    [
      "logo",
      "card",
      "box",
      "lion"
    ],
    [
      "Texture2D1",
      "Texture2D2"
    ],
    [
      "TextureCube-six",
      "TextureCube2-six",
      "hdr-hdr",
    ]
  );
  createNewYearService( "new-year", "./src/assets");

  const no = 2

  for(let i = 1; i <= no; i++) {
    // 1. 实例化一个播放器
    const player = new Player({
      container: document.getElementById(`effect-${i}`),
      pixelRatio: window.devicePixelRatio || 2,
    });

    // 2. 加载并播放动效资源
    player
      .loadScene(`/src/assets/effect/effect_${i}/effect_${i}.json`)
      .catch(err => {
        // 降级逻辑，以下仅供参考
        container.style.backgroundImage = 'url("替换为降级图路径/链接")';
      });
    }
  })
</script>

<template>
  <div class="container">
    <div class="item">
      <canvas style="width: 300px; height: 500px" id="canvas" />
    </div>
    <div class="item">
      <img style="width: 300px;" src="./assets/example.jpg">
      <canvas style="margin-left: -180px; width: 180px; height: 300px" id="new-year" />
    </div>
    <div class="item">
      <img style="width: 300px;" src="./assets/example.jpg">
      <div id="effect-1" style="position: absolute; left: 0; top: 150px; width: 300px; height: 300px"></div>
    </div>
    <div class="item">
      <img style="width: 300px;" src="./assets/example.jpg">
      <div id="effect-2" style="position: absolute; left: 0; top: 150px; width: 300px; height: 300px"></div>
    </div>
  </div>
</template>

<style>
  .container {
    position: absolute;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-gap: 10px;
    height: 100%;
    width: 100%;
    overflow-y: scroll;
  }

  .item {
    position: relative;
  }
</style>

