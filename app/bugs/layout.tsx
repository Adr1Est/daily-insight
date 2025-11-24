export const dynamic = 'force-dynamic';

import { Home } from "lucide-react";
import Link from "next/link";

export default function BugsMain({ children }: { children: React.ReactNode }){
  return(
    <div className="min-h-dvh min-w-dvw flex flex-col justify-center items-center gap-3">
      <div className="flex items-center lg:justify-center max-h-200 overflow-y-auto w-full overflow-x-auto">
        {children}
      </div>
      <Link
        href={'/'}
        className="hover:text-orange-300"
      >
        <Home size={18}/>
      </Link>
    </div>
  )
}