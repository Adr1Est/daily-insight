import { prisma } from "@/app/utils/database";

export async function GET(req: Request){

  const authHeader = req.headers.get("authorization");
  if(authHeader !== `Bearer ${process.env.INTERNAL_TOKEN}`){
    return Response.json({error: "Unauthorized"}, {status: 401});
  }

  try{

    const response = await fetch(`${process.env.API_URL}/api/askAgent`,{
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.INTERNAL_TOKEN}`
      }
    });
    const { output } = await response.json();
    const { day, month, year, data } = JSON.parse(output);
    
    const newInsight = await prisma.insight.create({
      data:{
        data: data,
        day: Number(day),
        month: month,
        year: Number(year),
      }
    });

    return Response.json(newInsight);

  }catch(error){

    console.error('Prisma error:', error); // Verás esto en los logs de Vercel
    return Response.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, {status: 500});

  }
  
}