import { PrismaClient } from "@/lib/generated/prisma/client";

export async function GET(){
  try{

    const response = await fetch(`${process.env.API_URL}/api/askAgent`);
    const { output } = await response.json();
    const { day, month, year, data } = JSON.parse(output);
    
    const prisma = new PrismaClient();
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

    return Response.json({error}, {status: 500});

  }
  
}