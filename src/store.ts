import { shallowRef } from "vue";

// Create a global state for toast notifications
const globalToastState = shallowRef({
  message: "",
  show: false,
});

export const useGlobalToast = () => {
  return {
    refToast: globalToastState,
  };
};
