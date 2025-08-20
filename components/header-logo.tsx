import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface HeaderLogoProps {
  className?: string;
}

const HeaderLogo = ({ className }: HeaderLogoProps) => {
  return (
    <Link href="/" className={cn("flex items-center", className)}>
        <div className="items-center flex">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={28}
              height={28}
              className="transition-opacity duration-300 ease-in-out group-data-[collapsible=icon]:opacity-0"
            />
            <p className="overflow-hidden transition-all duration-300 ease-in-out max-w-[150px] group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:m-0 text-clip whitespace-nowrap font-semibold text-white text-xl mx-2">
                Finalyzer
            </p>
        </div>
    </Link>
  )
}

export default HeaderLogo