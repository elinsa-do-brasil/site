import { ArrowUpRight, Images } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import GalleryImage from "@/public/images/eletricista.webp";

/** Highlights field imagery and sends visitors to the public photo gallery. */
export function GalleryCard() {
  return (
    <Link
      href="/galeria"
      className="group relative min-h-88 overflow-hidden rounded-2xl border border-white/10 bg-elinsa-dark text-white shadow-xl shadow-elinsa-dark/12 lg:min-h-0"
    >
      <Image
        src={GalleryImage}
        alt="Equipe da Elinsa em operação de campo"
        fill
        className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
        sizes="(min-width: 1024px) 31vw, 100vw"
      />

      {/* gradiente base: preserva imagem, mas garante leitura no fundo */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,16,24,0.08)_0%,rgba(8,16,24,0.18)_38%,rgba(8,16,24,0.72)_78%,rgba(8,16,24,0.94)_100%)]" />

      {/* leve escurecimento lateral, opcional, dá profundidade */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.12),transparent_34%)]" />

      <div className="relative flex h-full min-h-88 flex-col justify-between p-6">
        <div className="inline-flex w-fit items-center gap-2 rounded-md border border-white/18 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-xs">
          <Images aria-hidden="true" className="size-4" />
          Operação em campo
        </div>

        <div className="mt-auto max-w-sm">
          <p className="text-2xl font-black leading-tight tracking-normal md:text-3xl">
            Veja a operação de perto.
          </p>

          <p className="mt-4 text-sm leading-6 text-white/76">
            Registros, comunicados e iniciativas mostram como as equipes atuam
            em diferentes regiões do Pará.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white">
            Ver galeria
            <ArrowUpRight
              aria-hidden="true"
              className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
