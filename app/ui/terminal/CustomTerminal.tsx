import { Terminal, AnimatedSpan, TypingAnimation } from "@/app/ui/shadcn-io/terminal"
import prisma from "@/app/utils/database";

export default async function CustomTerminal(){

  const lastInsight = await prisma.insight.findFirst({
    orderBy: {
      createdAt: "desc",
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
        <AnimatedSpan delay={0}>
          {`Curiosidad del día ${lastInsight?.day} de ${lastInsight?.month} de ${lastInsight?.year}`}
        </AnimatedSpan>
        <TypingAnimation delay={500}>{`${lastInsight?.data}`}</TypingAnimation>
      </Terminal>
    </div>
    
  )
}