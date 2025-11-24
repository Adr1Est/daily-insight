export default function BugsMain({ children }: { children: React.ReactNode }){
  return(
    <div className="min-h-dvh min-w-dvw flex flex-col justify-center items-center">
      {children}
    </div>
  )
}