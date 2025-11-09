import { os } from "@orpc/server";
import { z } from "zod";

// Example procedure - replace with your actual procedures
const hello = os
  .input(
    z.object({
      name: z.string(),
    })
  )
  .output(
    z.object({
      message: z.string(),
    })
  )
  .route({
    method: "GET",
    path: "/hello",
  })
  .handler(async ({ input }) => {
    return {
      message: `Hello, ${input.name}!`,
    };
  });

export const router = os.router({
  hello,
});
export type Router = typeof router;
