import type { AppRouter } from "@server/src/api/trpc";
import { createTRPCReact } from "@trpc/react-query";

export const trpc = createTRPCReact<AppRouter>();
