import { createGlobalState } from "@vueuse/core";
import { ref } from "vue";

export const useGlobalToast = createGlobalState(() => {
  const refToast = ref({
    message: "",
    show: false,
  });

  return {
    refToast,
  };
});
