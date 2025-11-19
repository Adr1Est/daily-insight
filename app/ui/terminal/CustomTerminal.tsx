import { Terminal, AnimatedSpan, TypingAnimation } from "@/components/ui/shadcn-io/terminal"
import { PrismaClient } from "@/lib/generated/prisma/client";

export default async function CustomTerminal(){

  const prisma = new PrismaClient();
  const lastInsight = await prisma.insight.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  });

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