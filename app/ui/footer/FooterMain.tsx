import { Github, Bot, Linkedin, SquareChartGantt } from 'lucide-react'
import Link from 'next/link';

export default function FooterMain(){
  return(
    <div className="flex flex-col justify-center items-center text-xs opacity-50">
      
      <div className='flex flex-col sm:flex-row gap-3'>
        <p>&copy; 2025 Desarrollado por Adrián Estévez</p>

        <div className='flex flex-row gap-1'>
          <a 
            className='cursor-pointer hover:text-orange-300'
            href='https://github.com/Adr1Est'
            target='_blank'
          >
            <Github size={15}/>
          </a>
          <a 
            className='cursor-pointer hover:text-orange-300'
            href='https://www.linkedin.com/in/adrianestevezsalamanca/'
            target='_blank'
          >
            <Linkedin size={15}/>
          </a>
          <a 
            className='cursor-pointer hover:text-orange-300'
            href='https://www.adrianestevezs.dev'
            target='_blank'
          >
            <SquareChartGantt size={15}/>
          </a>

          <Link
            href={"/bugs"}
            className='hover:text-orange-300'
          >
            <p>Bugs</p>
          </Link>

        </div>
        
      </div>

      <div className='flex flex-row gap-1'>
        <Bot size={15}/>
        <p className='italic'>Powered by gpt-5-nano</p>
      </div>
      
    </div>
  )
}