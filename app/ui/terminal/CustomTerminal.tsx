export const dynamic = 'force-dynamic';

import { Terminal, AnimatedSpan, TypingAnimation } from "@/app/ui/shadcn-io/terminal"
import prisma from "@/lib/prisma";

export default async function CustomTerminal(){

  const lastInsight = await prisma.insight.findFirst({
    orderBy: {
      id: "desc",
    },
  });

  if(!lastInsight){
    return(
      <Terminal>
        <TypingAnimation delay={500}>No hay datos</TypingAnimation>
      </Terminal>
    )
  }

  return(
    <div className="w-full">
      <Terminal>
        <AnimatedSpan delay={50}>
          {`Curiosidad del día ${lastInsight?.day} de ${lastInsight?.month} de ${lastInsight?.year}`}
        </AnimatedSpan>
        <AnimatedSpan delay={500}>
          {`Videojuego:`}
        </AnimatedSpan>
        <AnimatedSpan delay={1000}>
          {`Plataforma:`}
        </AnimatedSpan>
        <AnimatedSpan delay={1500}>
          {`Año:`}
        </AnimatedSpan>
        <AnimatedSpan delay={1800}><hr/></AnimatedSpan>
        <TypingAnimation delay={2000} duration={20}>{`${lastInsight?.data}`}</TypingAnimation>
      </Terminal>
    </div>
    
  )
}