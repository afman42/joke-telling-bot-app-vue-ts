export {};

declare global {
  type IDataJoke = {
    type: string;
    setup: string;
    punchline: string;
    id: number;
  };
}
