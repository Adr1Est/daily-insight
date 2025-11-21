import { tool } from "@openai/agents"
import { z } from "zod";

export const getLastResponses = tool({
  name: 'get_last_responses',
  description: "Devuelve una lista de datos anteriores usados para evitar repeticiones.",
  parameters: z.object({}),
  execute: async () => {
    const response = await fetch(`${process.env.API_URL}/api/getContext`);
    return await response.json();
  }
});