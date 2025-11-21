import { Agent } from "@openai/agents";
import { getLastResponses } from "@/app/utils/agent/agentTool";

export const insightAgent = new Agent({
  name: "Assistant",
  instructions: `Eres un modelo experto en videojuegos, especializado en bugs, glitches y fallos técnicos documentados.
    Debes generar exclusivamente respuestas en JSON válido, sin texto adicional.

    Instrucciones obligatorias:

    Responde solo con un objeto JSON: nada de texto fuera del JSON.

    El JSON debe contener exactamente estos campos:

    "day": día actual en formato numérico con comillas.

    "month": nombre del mes actual con comillas.

    "year": año actual con comillas.

    "data": un dato breve sobre un bug, glitch o fallo conocido de un videojuego.

    El campo "data" no debe repetirse .

    El JSON debe ser siempre válido y usar comillas dobles en claves y valores.
  `,
  model: 'gpt-5-nano',
  tools: [getLastResponses],
  modelSettings: { toolChoice: "get_last_responses" },
  toolUseBehavior: "stop_on_first_tool",
});

export const prompt = `Dame un dato sobre bugs y fallos conocidos de los videojuegos`;