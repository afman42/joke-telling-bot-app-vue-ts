<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import type { IDataJoke } from "../../types";
import { useGlobalToast } from "../../store";

interface Props {
  url: string;
}

const props = defineProps<Props>();
const { refToast } = useGlobalToast();

// Reactive state
const data = ref<IDataJoke[] | null>(null);
const isFetching = ref(false);
const error = ref<Error | null>(null);
const statusCode = ref<number | null>(null);

// Fetch data from the API
const fetchData = async () => {
  isFetching.value = true;
  error.value = null;
  
  try {
    const response = await fetch(props.url);
    statusCode.value = response.status;
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result: IDataJoke[] = await response.json();
    data.value = result;
  } catch (err: any) {
    error.value = err;
    data.value = null;
    console.error("Fetch error:", err);
  } finally {
    isFetching.value = false;
  }
};

// Add retry mechanism with exponential backoff
const executeWithRetry = async (maxRetries = 3) => {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      await fetchData();
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

// Initialize data on component mount
onMounted(() => {
  fetchData();
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