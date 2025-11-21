export const dynamic = 'force-dynamic';

import { Terminal, AnimatedSpan, TypingAnimation } from "@/app/ui/shadcn-io/terminal"
import prisma from "@/lib/prisma";
import Info from "@/app/ui/terminal/Info"

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
          <p>
            Curiosidad del día <Info>{`${lastInsight?.day} `}</Info>
            de <Info>{lastInsight?.month}</Info> de <Info>{`${lastInsight?.year} `}</Info>
          </p>
        </AnimatedSpan>

        <AnimatedSpan delay={500}>
          <p>Videojuego: <Info>{lastInsight.game}</Info></p>
        </AnimatedSpan>

        <AnimatedSpan delay={1000}>
          <p>Plataforma: <Info>{lastInsight.platform}</Info></p>
        </AnimatedSpan>

        <AnimatedSpan delay={1500}>
          <p>Año: <Info>{`${lastInsight?.bugYear}`}</Info></p>
        </AnimatedSpan>

        <AnimatedSpan delay={1800}><hr/></AnimatedSpan>

        <TypingAnimation delay={2000} duration={20}>{`${lastInsight?.data}`}</TypingAnimation>

      </Terminal>
    </div>
    
  )
}