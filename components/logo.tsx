import Image from "next/image";
import { cn } from "@/lib/utils";
import LogoImage from "@/public/images/logo.webp"

export function Logo() {
  return (
    <div>
      <Image 
        src={LogoImage} 
        alt="Elinsa" 
        className={cn("h-18 w-auto", "mx-auto")}
      />
    </div>
  );
}