import { QueryClient } from "@tanstack/react-query";
import { httpLink } from "@trpc/client";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App.tsx";
import "./index.css";
import { trpc } from "./trpc";

const queryClient = new QueryClient();

const trpcClient = trpc.createClient({
  links: [httpLink({ url: "/api/trpc" })],
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <App />
    </trpc.Provider>
  </StrictMode>,
);
