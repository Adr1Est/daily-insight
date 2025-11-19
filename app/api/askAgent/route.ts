import { insightAgent, prompt } from "@/app/utils/agent";
import { run } from "@openai/agents";

export async function GET(){
  try{
    
    const response = await run(insightAgent, prompt);
    return Response.json({output: response.finalOutput});

  }catch(error){

    return Response.json({error}, {status: 500});
    
  }
}