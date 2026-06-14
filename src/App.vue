<script setup lang="ts">
import { ref, computed } from "vue";
import Toast from "./components/Toast.vue";
import JokeFetcher from "./components/Joke/JokeFetcher.vue";
import VoiceControls from "./components/Joke/VoiceControls.vue";
import KeyboardHandler from "./components/Joke/KeyboardHandler.vue";
import type { IDataJoke } from "./types";

interface JokeFetcherAPI {
  error: { value: Error | null };
  isFetching: { value: boolean };
  statusCode: { value: number | null };
  currentJoke: { value: IDataJoke | null };
  executeWithRetry: (maxRetries?: number) => Promise<void>;
}

interface VoiceControlsAPI {
  play: () => void;
  speech: { isSupported: boolean };
}

const apiUrl = import.meta.env.VITE_JOKE_URL || "";

const jokeFetcherRef = ref<JokeFetcherAPI | null>(null);
const voiceControlsRef = ref<VoiceControlsAPI | null>(null);

const errorMessage = computed(() => {
  if (jokeFetcherRef.value?.error?.value) {
    return jokeFetcherRef.value.error.value.message || "Failed to load joke";
  }
  return null;
});

const handleJKeyPress = () => {
  voiceControlsRef.value?.play();
  jokeFetcherRef.value?.executeWithRetry();
};
</script>

<template>
  <div role="main" aria-label="Joke Telling Bot Application">
    <div v-if="!apiUrl" role="alert">
      No joke API URL configured. Set <code>VITE_JOKE_URL</code> environment variable.
    </div>
    <template v-else>
      <JokeFetcher ref="jokeFetcherRef" :url="apiUrl" />

      <div v-if="!voiceControlsRef?.speech?.isSupported" role="alert">
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
          <h1>Joke Teller</h1>
          <div
            v-if="errorMessage"
            role="alert"
            aria-live="polite"
          >
            Error: {{ errorMessage }}
          </div>

          <section aria-labelledby="controls-heading">
            <h2 id="controls-heading" class="sr-only">Voice Controls</h2>

            <VoiceControls
              ref="voiceControlsRef"
              :joke="jokeFetcherRef?.currentJoke?.value ?? null"
              :is-fetching="jokeFetcherRef?.isFetching?.value ?? false"
              :status-code="jokeFetcherRef?.statusCode?.value ?? null"
            />
          </section>
        </div>
      </div>
      <KeyboardHandler @j-key="handleJKeyPress" />
    </template>
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