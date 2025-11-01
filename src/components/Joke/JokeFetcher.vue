<script setup lang="ts">
import { useFetch } from "@vueuse/core";
import { computed, watch } from "vue";
import type { IDataJoke } from "../../types";
import { useGlobalToast } from "../../store";

interface Props {
  url: string;
}

const props = defineProps<Props>();
const { refToast } = useGlobalToast();

const { data, isFetching, error, execute, statusCode } = useFetch<IDataJoke[]>(props.url).get().json();

// Add retry mechanism with exponential backoff
const executeWithRetry = async (maxRetries = 3) => {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      await execute();
      if (!error.value) {
        break; // Success, exit retry loop
      }
    } catch (err) {
      console.error(`Attempt ${retries + 1} failed:`, err);
    }
    
    retries++;
    if (retries < maxRetries) {
      // Exponential backoff: wait 1s, 2s, 4s between retries
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
    }
  }
  
  if (retries === maxRetries && error.value) {
    refToast.value = {
      show: true,
      message: `Failed to load joke after ${maxRetries} attempts. Please try again later.`
    };
    setTimeout(function(){ 
      refToast.value = {
        show: false,
        message: ''
      }
    }, 5000);
  }
};

// Computed value for the current joke
const currentJoke = computed(() => {
  if (data.value && Array.isArray(data.value) && data.value.length > 0) {
    const joke = data.value[0];
    // Validate joke structure
    if (joke && typeof joke.setup === 'string' && joke.setup.trim() !== '') {
      return joke;
    }
  }
  return null;
});

// Watch for errors and show toast notification
watch(error, (errorValue) => {
  if (errorValue) {
    refToast.value = {
      show: true,
      message: `Error: ${errorValue.message || 'Failed to load joke'}`
    };
    setTimeout(function(){ 
      refToast.value = {
        show: false,
        message: ''
      }
    }, 3000);
  }
});

// Expose values to parent component
defineExpose({
  data,
  isFetching,
  error,
  executeWithRetry,
  statusCode,
  currentJoke
});
</script>