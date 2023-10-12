<script setup lang="ts">
import { onMounted } from "vue";
import { createRuntime } from "./runtime";


onMounted(() => {
  createRuntime("canvas");
})
</script>

<template>
	<canvas style="width: 300px; height: 500px" id="canvas" />
</template>

