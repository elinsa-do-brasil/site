import Image from "next/image";
import Link from "next/link";
import { Map as MapIcon, MapPin } from "lucide-react";
import { ArrowRight02Icon, Building01Icon } from "@hugeicons/core-free-icons";

import Eletricista from "@/public/eletricistas.png";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { MapAbaetetuba, MapAltamira, MapBelem, MapParagominas, MapSantarem } from "@/components/maps/municipalities";

export default function Hero() {
  return (
    <main>
      <section className="relative w-dvw h-dvh flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src={Eletricista}
            alt="Profissional Eletricista"
            className="h-full w-full object-cover object-center"
            priority
          />
        </div>

        {/* Conteúdo */}
        <div className="relative z-10 max-w-5xl mx-auto mt-30 w-full">
          <div
            className="
            relative max-w-xl

            before:content-['']
            before:absolute
            before:-inset-x-16 before:-inset-y-12
            before:-z-10

            before:bg-[radial-gradient(circle_at_left_center,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.75)_40%,rgba(255,255,255,0.35)_70%,transparent_100%)]

            before:blur-2xl
          "
          >
            <h1 className="text-3xl md:text-5xl font-bold leading-tight text-black">
              Excelência em infraestrutura elétrica
            </h1>

            <p className="mt-5 text-lg md:text-xl text-black/70 leading-relaxed">
              Como parceira estratégica do grupo Equatorial Energia, somos
              especialistas em obras complexas. Realizamos instalação de postes,
              implantação e manutenção contínua de redes de distribuição.
            </p>

            <p className="mt-4 text-sm text-black/60">
              * Atuação exclusiva empresarial. Não atendemos ao público.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button variant={"secondary"} size={"xl"} asChild>
                <Link href="/imprensa">
                  Conheça nossas obras <HugeiconsIcon icon={ArrowRight02Icon} />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative max-w-6xl mx-auto py-24 px-6 md:px-8">
        {/* Efeito visual de fundo */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

        <div className="flex flex-col gap-6 items-start mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
            <HugeiconsIcon icon={Building01Icon} className="w-4 h-4" />
            <span>Infraestrutura Distribuída</span>
          </div>
          
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
              Nossas <span className="text-primary">Bases Estratégicas</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Aqui estão nossas bases operacionais e administrativas. É a partir
              destes polos estratégicos que mobilizamos nossas equipes e 
              equipamentos, garantindo agilidade e capacidade de atendimento 
              para projetos complexos em diversas regiões do estado.
            </p>
          </div>
        </div>

        {/* Grid Bento para os mapas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <div className="lg:col-span-2">
            <MapAbaetetuba />
          </div>
          <div className="lg:col-span-2">
            <MapAltamira />
          </div>
          <div className="lg:col-span-2">
            <MapBelem />
          </div>
          <div className="lg:col-span-2">
            <MapParagominas />
          </div>
          <div className="lg:col-span-2">
            <MapSantarem />
          </div>
          <div className="lg:col-span-2">
            <Link 
              href="/mapas" 
              className="group h-100 flex flex-col justify-between p-8 rounded-xl bg-primary text-primary-foreground overflow-hidden relative shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500 pointer-events-none">
                <MapIcon className="w-64 h-64 -mr-16 -mt-16 text-primary-foreground" />
              </div>
              
              <div className="relative z-10">
                <div className="w-12 h-12 bg-primary-foreground/20 rounded-full flex items-center justify-center mb-6">
                  <MapPin className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-3xl font-bold tracking-tight mb-3">Mapa Geral</h3>
                <p className="text-primary-foreground/90 leading-relaxed">
                  Explore a divisão de nossas regionais e descubra todos os municípios 
                  sob responsabilidade de cada base operacional.
                </p>
              </div>

              <div className="relative z-10 mt-8 flex items-center gap-2 font-semibold text-lg">
                <span>Acessar Mapa Completo</span>
                <HugeiconsIcon icon={ArrowRight02Icon} className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
