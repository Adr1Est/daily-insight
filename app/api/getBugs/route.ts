import { getAllInsights } from "@/lib/data";

export async function GET(){

  try {

    const data = await getAllInsights();

    return Response.json(data);

  } catch (error) {

    return Response.json({error}, {status: 500});

  }

}
