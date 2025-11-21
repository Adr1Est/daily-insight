import prisma from "@/lib/prisma";

export async function GET(req: Request){

  const authHeader = req.headers.get("authorization");
  if(authHeader !== `Bearer ${process.env.INTERNAL_TOKEN}`){
    return Response.json({error: "Unauthorized"}, {status: 401});
  }

  try {
    
    const data = await prisma.insight.findMany({
      orderBy: {
        id: 'desc'
      },
      take: 10,
    });

    const aiContext = data.map(info => info.data);

    return Response.json(aiContext);

  } catch (error) {

    return Response.json({error}, {status: 500});

  }
}