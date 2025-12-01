import { Home } from "lucide-react";
import Link from "next/link";

export default function BugsMain({ children }: { children: React.ReactNode }){
  return(
    <div className="min-h-dvh min-w-dvw flex flex-col justify-center items-center gap-3">
      <div className="flex lg:justify-center max-h-150 overflow-y-auto w-full overflow-x-auto">
        {children}
      </div>
      <Link
        href={'/'}
        className="p-2 bg-green-800 rounded-full hover:text-orange-300 fixed bottom-20 sm:bottom-0 right-10 sm:right-0 sm:relative opacity-80"
      >
        <Home size={18}/>
      </Link>
    </div>
  )
}