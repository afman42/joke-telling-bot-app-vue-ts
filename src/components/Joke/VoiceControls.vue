<script setup lang="ts">
import { ref, watch } from "vue";
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

// Store the current joke text separately
const currentText = ref("Loading joke...");
const voice = ref<SpeechSynthesisVoice | undefined>(undefined);
const pitch = ref(1);
const rate = ref(1);

// Create speech synthesis instance once
const speech = useSpeechSynthesis(currentText.value, {
  lang: "en-US",
  voice: voice.value || null,
  pitch: pitch.value,
  rate: rate.value,
  volume: 1
});

// Watch for joke changes and update speech text
watch(() => props.joke, (newJoke) => {
  if (newJoke && typeof newJoke.setup === 'string' && newJoke.setup.trim() !== '') {
    speech.setText(newJoke.setup);
  } else {
    speech.setText("No joke available. Please try again.");
  }
});

// Watch for changes in pitch and rate
watch(pitch, (newPitch) => {
  speech.setPitch(newPitch);
});

watch(rate, (newRate) => {
  speech.setRate(newRate);
});

// Function to play the joke
const play = () => {
  window.speechSynthesis.cancel();
  refToast.value = {
    show: true,
    message: "Refresh"
  };
  
  if (!props.isFetching && props.statusCode === 200) {
    setTimeout(() => { 
      refToast.value = {
        show: false,
        message: ''
      };
    }, 3000);
    speech.speak();
  }
};

// Expose play function to parent
defineExpose({
  play,
  speech,
  pitch,
  rate
});
</script>

<template>
  <div class="voice-controls">
    <div class="control-group">
      <label for="pitch-slider">Pitch</label>
      <div>
        <input 
          id="pitch-slider" 
          v-model="pitch" 
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
          v-model="rate" 
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
      :disabled="speech.isPlaying || isFetching" 
      @click="play"
      aria-label="Tell me this joke"
    >
      {{ isFetching ? 'Loading...' : 'Tell me this Joke' }}
    </button>
  </div>
</template>

<style scoped>
.control-group {
  margin: 1rem 0;
}

.action-group {
  margin: 1.5rem 0;
}
</style>