import type { SWRConfiguration } from "swr";

export const SWR_DEFAULT_OPTIONS: SWRConfiguration = {
  revalidateOnFocus: false,
  dedupingInterval: 30_000,
};
