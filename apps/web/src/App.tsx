import { QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/common";
import { queryClient } from "@/lib/queryClient";
import { AppRoutes } from "@/routes/AppRoutes";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
