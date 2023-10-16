<script setup lang="ts">
import { useSpeechSynthesis, useFetch } from "@vueuse/core";
import { ref, onMounted, watchEffect } from "vue";
import { useGlobalToast } from "./store"
import Toast from "./components/Toast.vue"

const { data, isFetching, error, execute, statusCode } = useFetch<IDataJoke[]>(import.meta.env.VITE_JOKE_URL).get().json();
let speech: ReturnType<typeof useSpeechSynthesis>;
let { refToast } = useGlobalToast();

const voice = ref<SpeechSynthesisVoice>(
  undefined as unknown as SpeechSynthesisVoice
);
const pitch = ref(1);
const rate = ref(1);

watchEffect(() => {
  speech = useSpeechSynthesis(
      !isFetching.value && data.value != null ? data.value[0].setup : "Restart Again",
      {
        lang: "en-US",
        voice,
        pitch,
        rate,
      }
    );
})

async function onKeyUpKeyboard(event: KeyboardEvent){
  if(['j',"J"].includes(event.key)){
    play();
    execute();
  }
}

onMounted(() => {
  document.body.addEventListener('keyup',onKeyUpKeyboard)
});
function play() {
  window.speechSynthesis.cancel();
  refToast.value = {
    show: true,
    message: "Refresh"
  }
  if(!isFetching.value && statusCode.value === 200) {
    setTimeout(function(){ 
      refToast.value = {
        show: false,
        message: ''
      }
    }, 3000);
    speech.speak();
  }
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
        <div style="font-size: 100px;">🤖</div>
        <div>{{ error ? "Error :" + error : "" }}</div>

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
          <button :disabled="speech.isPlaying.value || isFetching" @click="() => {
            play();
            execute();
          }">
            Telling me about Joke
          </button>
        </div>
      </div>
    </div>
    <Toast/>
  </div>
</template>
