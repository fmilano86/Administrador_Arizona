import { QueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      // No reintentar errores 4xx (son errores del pedido, no de red)
      retry: (failureCount, error) => {
        if (
          isAxiosError(error) &&
          error.response &&
          error.response.status < 500
        )
          return false;
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
