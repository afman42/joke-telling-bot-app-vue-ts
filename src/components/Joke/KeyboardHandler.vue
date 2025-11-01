<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

const emit = defineEmits(['jKey']);

const handleKeyUp = (event: KeyboardEvent) => {
  if(['j', "J"].includes(event.key)){
    emit('jKey');
  }
};

onMounted(() => {
  document.body.addEventListener('keyup', handleKeyUp);
});

onUnmounted(() => {
  document.body.removeEventListener('keyup', handleKeyUp);
});
</script>

<template>
  <!-- This component just handles keyboard events -->
  <div style="display: none;" />
</template>