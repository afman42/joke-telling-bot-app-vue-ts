<script setup lang="ts">
import { watch, onUnmounted } from "vue";
import { useGlobalToast } from "../store";

const { refToast } = useGlobalToast();

let timeoutId: ReturnType<typeof setTimeout> | null = null;

watch(refToast, (newVal) => {
  if (newVal.show) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      refToast.value = { show: false, message: "", duration: 3000 };
      timeoutId = null;
    }, newVal.duration);
  }
});

onUnmounted(() => {
  if (timeoutId) clearTimeout(timeoutId);
});
</script>

<template>
  <teleport to="body">
    <div
      class="snackbar"
      :class="refToast.show ? 'show' : ''"
    >
      {{ refToast.message }}
    </div>
  </teleport>
</template>

<style>
.snackbar {
  visibility: hidden;
  min-width: 250px;
  margin-left: -125px;
  background-color: #333;
  color: #fff;
  text-align: center;
  border-radius: 2px;
  padding: 16px;
  position: fixed;
  z-index: 1;
  left: 50%;
  bottom: 30px;
}

.snackbar.show {
  visibility: visible;
  animation: fadein 0.5s, fadeout 0.5s 2.5s;
}

@keyframes fadein {
  from {
    bottom: 0;
    opacity: 0;
  }
  to {
    bottom: 30px;
    opacity: 1;
  }
}

@keyframes fadeout {
  from {
    bottom: 30px;
    opacity: 1;
  }
  to {
    bottom: 0;
    opacity: 0;
  }
}
</style>