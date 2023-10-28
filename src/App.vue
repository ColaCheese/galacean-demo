<script setup lang="ts">
import { onMounted } from "vue";
import { createRuntime } from "./runtime";


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
    ]
  );
})
</script>

<template>
  <canvas style="width: 300px; height: 500px" id="canvas" />
</template>

