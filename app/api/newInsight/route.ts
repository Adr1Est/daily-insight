import prisma from "@/lib/prisma";

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
    const { game, platform, bugYear, day, month, year, data } = JSON.parse(output);
    
    const newInsight = await prisma.insight.create({
      data:{
        data: data,
        day: Number(day),
        month: month,
        year: Number(year),
        game: game,
        platform: platform,
        bugYear: Number(bugYear),
      }
    });

    return Response.json(newInsight);

  }catch(error){

    return Response.json({error}, {status: 500});

  }
  
}