<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import type { IDataJoke } from "../../types";
import { useGlobalToast } from "../../store";

interface Props {
  url: string;
}

const props = defineProps<Props>();
const { refToast } = useGlobalToast();

const data = ref<IDataJoke[] | null>(null);
const isFetching = ref(false);
const error = ref<Error | null>(null);
const statusCode = ref<number | null>(null);

let abortController: AbortController | null = null;

const fetchData = async () => {
  if (abortController) {
    abortController.abort();
  }
  abortController = new AbortController();

  isFetching.value = true;
  error.value = null;

  try {
    const response = await fetch(props.url, { signal: abortController.signal });
    statusCode.value = response.status;

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result: IDataJoke[] = await response.json();
    data.value = result;
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return;
    }
    error.value = err instanceof Error ? err : new Error(String(err));
    data.value = null;
    console.error("Fetch error:", err);
  } finally {
    isFetching.value = false;
  }
};

const executeWithRetry = async (maxRetries = 3) => {
  let retries = 0;

  while (retries < maxRetries) {
    await fetchData();
    if (!error.value) {
      break;
    }

    retries++;
    if (retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
    }
  }

  if (retries === maxRetries && error.value) {
    refToast.value = {
      show: true,
      message: `Failed to load joke after ${maxRetries} attempts. Please try again later.`,
      duration: 5000
    };
  }
};

const currentJoke = computed(() => {
  if (data.value && Array.isArray(data.value) && data.value.length > 0) {
    const joke = data.value[0];
    if (joke && typeof joke.setup === 'string' && joke.setup.trim() !== '') {
      return joke;
    }
  }
  return null;
});

onMounted(() => {
  fetchData();
});

onUnmounted(() => {
  if (abortController) {
    abortController.abort();
  }
});

defineExpose({
  data,
  isFetching,
  error,
  executeWithRetry,
  statusCode,
  currentJoke
});
</script>