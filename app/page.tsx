export const dynamic = 'force-dynamic';

import Info from "@/app/ui/info/Info";
import CustomTerminal from "@/app/ui/terminal/CustomTerminal";
import { Suspense } from "react";
import Loader from "@/app/ui/loaders/Loader";
import FooterMain from "./ui/footer/FooterMain";

export default function Home() {
  return (
    <div className="min-h-dvh min-w-dvw flex flex-col justify-center items-center ">
      <main className="flex flex-col gap-3 w-full md:w-2/5 justify-center items-center">

        <Info/>
              
        <Suspense fallback={<Loader/>}>
          <CustomTerminal/>
        </Suspense>

        <FooterMain/>

      </main>
    </div>
  );
}
