import { Terminal, AnimatedSpan, TypingAnimation } from "@/components/ui/shadcn-io/terminal"

export default async function CustomTerminal(){

  const response: Response = await fetch(`${process.env.API_URL}/api/openai`);
  const { output } = await response.json();
  const info = JSON.parse(output);

  return(
    <div className="w-full">
      <Terminal>
        <AnimatedSpan delay={0}>$ npm install bug</AnimatedSpan>
        <TypingAnimation delay={1000} duration={100}>
          Generando bug del día...
        </TypingAnimation>
        <AnimatedSpan delay={2500}>
          {`Bug del día ${info.dia} de ${info.mes} de ${info.año}`}
        </AnimatedSpan>
        <TypingAnimation delay={4000}>{info.dato}</TypingAnimation>
      </Terminal>
    </div>
    
  )
}