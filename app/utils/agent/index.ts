import { Agent } from "@openai/agents";

export const insightAgent = new Agent({
  name: "Assistant",
  instructions: `Eres un modelo experto en videojuegos, especializado en bugs, glitches y fallos técnicos documentados.
    Debes generar exclusivamente respuestas en JSON válido, sin texto adicional.

    Instrucciones obligatorias:

    El JSON debe contener exactamente estos campos:

    "day": día actual en formato numérico con comillas.

    "month": nombre del mes actual en español y la primera letra en mayúscula con comillas.

    "year": año actual con comillas.

    "bugYear": año en el que ocurre el bug, glith o fallo conocido de la historia de los videojuegos.

    "game": videojuego relacionado con el bug, glith o fallo. Si no es un juego, poner "no es un juego".

    "platform": Plataforma en la que ocurrió el bug, glith o fallo. Ejemplo: Nintendo 64, XBOX, PS5, PC...

    "data": un dato breve y sin repetir las anteriores respuestas sobre un bug, glitch o fallo conocido de la historia de los videojuegos.

  `,
  model: 'gpt-5-nano',
});

export const createPrompt = async (): Promise<string> => {

  try{

    const response = await fetch(`${process.env.API_URL}/api/getContext`, {
      method: 'GET',
      headers: {
        "Authorization": `Bearer ${process.env.INTERNAL_TOKEN}`
      }
    });
    if(!response.ok) throw new Error("Error fetching context");
    const data = await response.json();

    const lastResponses: string[] = data.map((info: {game:string, data: string}, index: number) => `${index + 1}. ${info.game}: ${info.data}`);
    const prompt = `Dada una lista de últimas respuestas:
    ${lastResponses.join("\n")}
    Dame un dato sobre bugs y fallos conocidos de la historia de los videojuegos evitando repetir datos y videojuegos anteriores.`;

    return prompt;

  }catch(error){

    console.error("Error fetching context", error);
    return "Dame un dato sobre bugs y fallos conocidos de la historia de los videojuegos";
  }
  
};