import Image from "next/image"
import Link from "next/link"

const HeaderLogo = () => {
  return (
    <Link href="/">
        <div className="items-center hidden md:flex">
            <Image src="/logo.svg" alt="Logo" width={28} height={28} />
            <p className="font-semibold text-white text-2xl mx-2">
                Finalyzer
            </p>
        </div>
    </Link>
  )
}
export default HeaderLogo