import { keepPreviousData, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpLink } from "@trpc/client";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App.tsx";
import "./index.css";
import { trpc } from "./trpc";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      placeholderData: keepPreviousData,
    },
  },
});

const trpcClient = trpc.createClient({
  links: [httpLink({ url: "/api/trpc" })],
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <App />
      </trpc.Provider>
    </QueryClientProvider>
  </StrictMode>,
);
