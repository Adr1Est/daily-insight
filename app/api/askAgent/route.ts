import { insightAgent, createPrompt } from "@/app/utils/agent";
import { run } from "@openai/agents";

export async function GET(req: Request){

  const authHeader = req.headers.get("authorization");
  if(authHeader !== `Bearer ${process.env.INTERNAL_TOKEN}`){
    return Response.json({error: "Unauthorized"}, {status: 401});
  }

  try{

    const prompt = await createPrompt();
    const response = await run(insightAgent, prompt);
    return Response.json({output: response.finalOutput});

  }catch(error){

    return Response.json({error}, {status: 500});
    
  }
}