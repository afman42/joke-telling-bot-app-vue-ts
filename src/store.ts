import { shallowRef } from "vue";

const globalToastState = shallowRef({
  message: "",
  show: false,
  duration: 3000,
});

export const useGlobalToast = () => {
  return {
    refToast: globalToastState,
  };
};
