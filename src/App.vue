<script setup lang="ts">
import Toast from "./components/Toast.vue";
import JokeFetcher from "./components/Joke/JokeFetcher.vue";
import VoiceControls from "./components/Joke/VoiceControls.vue";
import KeyboardHandler from "./components/Joke/KeyboardHandler.vue";
import { ref } from "vue";

// Get the API URL - fallback to empty string if environment variable is not available
const apiUrl = import.meta.env.VITE_JOKE_URL || "";

// Reference to child components
const jokeFetcherRef = ref<InstanceType<typeof JokeFetcher> | null>(null);
const voiceControlsRef = ref<InstanceType<typeof VoiceControls> | null>(null);

// Handler for J key press
const handleJKeyPress = () => {
  if (voiceControlsRef.value) {
    voiceControlsRef.value.play();
  }
  if (jokeFetcherRef.value) {
    jokeFetcherRef.value.executeWithRetry();
  }
};
</script>

<template>
  <div role="main" aria-label="Joke Telling Bot Application">
    <JokeFetcher ref="jokeFetcherRef" :url="apiUrl" />

    <div v-if="!voiceControlsRef?.speech?.isSupported?.value" role="alert">
      Your browser does not support SpeechSynthesis API,
      <a
        href="https://caniuse.com/mdn-api_speechsynthesis"
        target="_blank"
        rel="noopener noreferrer"
        >more details</a
      >
    </div>
    <div v-else>
      <div>
        <h1>🤖 Joke Teller</h1>
        <div
          v-if="jokeFetcherRef?.error?.value"
          role="alert"
          aria-live="polite"
        >
          {{
            "Error: " +
            (jokeFetcherRef.error.value?.message || "Failed to load joke")
          }}
        </div>

        <section aria-labelledby="controls-heading">
          <h2 id="controls-heading" class="sr-only">Voice Controls</h2>

          <VoiceControls
            ref="voiceControlsRef"
            :joke="jokeFetcherRef?.currentJoke || null"
            :is-fetching="jokeFetcherRef?.isFetching || false"
            :status-code="jokeFetcherRef?.statusCode || null"
          />
        </section>
      </div>
    </div>
    <KeyboardHandler @j-key="handleJKeyPress" />
    <Toast />
  </div>
</template>

<style>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
