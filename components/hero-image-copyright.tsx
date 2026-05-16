"use client";

import { usePathname } from "next/navigation";
import { Separator } from "./ui/separator";

export function HeroImageCopyright() {
  const pathname = usePathname();

  if (pathname !== "/") {
    return null;
  }

  return (
    <>
      <Separator />
      <p className="text-center text-sm text-muted-foreground max-w-5xl mx-auto">
        Imagem de capa: Eletricistas trabalhando em cesto aéreo, por <Link href="https://www.pexels.com/pt-br/foto/pessoas-homens-industria-conexao-10130754/" text="Chris F." /> via <Link href="https://www.pexels.com/pt-br/" text="Pexels" />.
        <br />
        Modificada digitalmente para fins institucionais da Elinsa do Brasil por <Link href="https://github.com/raave-aires" text="Raave Aires" />.
      </p>
    </>
  );
}

function Link({ href, text }: { href: string; text: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-elinsa-primary hover:underline"
    >
      {text}
    </a>
  );
}