<script setup lang="ts">
import { useSpeechSynthesis, useFetch } from "@vueuse/core";
import { ref, onMounted, watchEffect } from "vue";

const { data, isFetching, error, execute } = useFetch<IDataJoke[]>(import.meta.env.VITE_JOKE_URL).get().json();
let speech: ReturnType<typeof useSpeechSynthesis>;

const voice = ref<SpeechSynthesisVoice>(
  undefined as unknown as SpeechSynthesisVoice
);
const pitch = ref(1);
const rate = ref(1);

watchEffect(() => {
    speech = useSpeechSynthesis(
      data.value != null ? data.value[0].setup : "Restart Again",
      {
        voice,
        pitch,
        rate,
      }
    );
})



let synth: SpeechSynthesis;

const voices = ref<SpeechSynthesisVoice[]>([])

onMounted(() => {
  if (speech.isSupported.value) {
    // load at last
    setTimeout(() => {
      synth = window.speechSynthesis;
      voices.value = synth.getVoices();
      voice.value = voices.value[0];
    });
  }
});
function play() {
  if (speech.status.value === "pause") {
    console.log("resume");
    window.speechSynthesis.resume();
  } else {
    if(!isFetching.value){
      speech.speak();
    }
  }
}

function pause() {
  window.speechSynthesis.pause();
}

function stop() {
  speech.stop();
}

</script>

<template>
  <div>
    <div v-if="!speech.isSupported">
      Your browser does not support SpeechSynthesis API,
      <a href="https://caniuse.com/mdn-api_speechsynthesis" target="_blank"
        >more details</a
      >
    </div>
    <div v-else>
      <div>
        <div>{{ isFetching ? "Still Fetching" : '' }}</div>
        <div>{{ error ? "Error :" + error : "" }}</div>
        <label>Language</label>
        <div>
          <select v-model="voice">
            <option disabled>Select Language</option>
            <option
              v-for="(voice, i) in voices"
              :key="i"
              :value="voice"
            >
              {{ `${voice.name} (${voice.lang})` }}
            </option>
          </select>
        </div>

        <br />
        <div>
          <label>Pitch</label>
          <div>
            <input v-model="pitch" type="range" min="0.5" max="2" step="0.1" />
          </div>
        </div>

        <br />
        <div>
          <label>Rate</label>
          <div>
            <input v-model="rate" type="range" min="0.5" max="2" step="0.1" />
          </div>
        </div>

        <div>
          <button :disabled="speech.isPlaying.value || isFetching" @click="play">
            {{ speech.status.value === "pause" ? "Resume" : "Speak" }}
          </button>
          <button
            :disabled="!speech.isPlaying.value"
            class="orange"
            @click="pause"
          >
            Pause
          </button>
          <button :disabled="!speech.isPlaying.value" class="red" @click="stop">
            Stop
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
