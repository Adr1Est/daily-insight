import prisma from "@/lib/prisma";

export async function GET(){

  try {
    
    const data = await prisma.insight.findMany({
      orderBy: {
        id: 'desc'
      }
    });

    return Response.json(data);

  } catch (error) {
    
    return Response.json({error}, {status: 500});

  }

}