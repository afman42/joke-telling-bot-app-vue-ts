<script setup lang="ts">
import { watch } from "vue";
import type { IDataJoke } from "../../types";
import { useGlobalToast } from "../../store";
import { useSpeechSynthesis } from "../../composables/useSpeechSynthesis";

interface Props {
  joke: IDataJoke | null;
  isFetching: boolean;
  statusCode: number | null;
}

const props = withDefaults(defineProps<Props>(), {
  joke: null,
  isFetching: false,
  statusCode: null
});

const { refToast } = useGlobalToast();

const speech = useSpeechSynthesis("Loading joke...", {
  lang: "en-US",
  pitch: 1,
  rate: 1,
  volume: 1
});

watch(() => props.joke, (newJoke) => {
  if (newJoke && typeof newJoke.setup === 'string' && newJoke.setup.trim() !== '') {
    speech.text.value = newJoke.setup + ". " + newJoke.punchline;
  } else {
    speech.text.value = "No joke available. Please try again.";
  }
});

const play = () => {
  speech.stop();
  refToast.value = {
    show: true,
    message: "Refresh",
    duration: 3000
  };

  if (!props.isFetching && props.statusCode === 200) {
    speech.speak();
  }
};

defineExpose({
  play,
  speech,
  pitch: speech.pitch,
  rate: speech.rate
});
</script>

<template>
  <div v-if="joke && joke.setup" class="joke-card">
    <p class="joke-setup">{{ joke.setup }}</p>
    <p class="joke-punchline">{{ joke.punchline }}</p>
  </div>

  <div class="voice-controls">
    <div class="control-group">
      <label for="pitch-slider">Pitch</label>
      <div>
        <input 
          id="pitch-slider" 
          v-model="speech.pitch.value" 
          type="range" 
          min="0.5" 
          max="2" 
          step="0.1"
          aria-label="Adjust pitch of speech"
        />
      </div>
    </div>

    <div class="control-group">
      <label for="rate-slider">Rate</label>
      <div>
        <input 
          id="rate-slider" 
          v-model="speech.rate.value" 
          type="range" 
          min="0.5" 
          max="2" 
          step="0.1"
          aria-label="Adjust rate of speech"
        />
      </div>
    </div>
  </div>

  <div class="action-group">
    <button 
      :disabled="speech.isPlaying.value || isFetching" 
      @click="play"
      aria-label="Tell me this joke"
    >
      {{ isFetching ? 'Loading...' : 'Tell me this Joke' }}
    </button>
  </div>
</template>

<style scoped>
.joke-card {
  background: rgba(100, 108, 255, 0.08);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem 0 1.5rem;
  border: 1px solid rgba(100, 108, 255, 0.15);
}

.joke-setup {
  font-size: 1.2em;
  font-weight: 500;
  margin: 0 0 1rem;
}

.joke-punchline {
  font-size: 1.1em;
  font-style: italic;
  margin: 0;
  opacity: 0.9;
}

.control-group {
  margin: 1rem 0;
}

.action-group {
  margin: 1.5rem 0;
}
</style>