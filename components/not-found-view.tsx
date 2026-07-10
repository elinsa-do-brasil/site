import { MoveRightIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function NotFoundView({ as = "main" }: { as?: "main" | "div" }) {
  const Root = as;

  return (
    <Root
      className={cn(
        "flex items-center justify-center px-4 py-12 text-foreground sm:px-6",
        as === "main" ? "min-h-dvh" : "min-h-[calc(100dvh-6rem)]",
      )}
    >
      <Card
        aria-labelledby="not-found-title"
        className="w-full max-w-xl text-center"
        variant="panel"
      >
        <CardHeader className="items-center text-center">
          <p className="font-mono text-sm font-semibold tracking-[0.18em] text-primary uppercase">
            Erro 404
          </p>
          <h1
            className="text-2xl font-bold tracking-tight sm:text-3xl"
            id="not-found-title"
          >
            Esta página não está disponível.
          </h1>
        </CardHeader>
        <CardContent>
          <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground">
            O endereço pode estar incorreto, ter mudado ou exigir uma permissão
            que sua conta não possui.
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Button asChild>
            <Link href="/">
              Voltar à página inicial
              <MoveRightIcon aria-hidden="true" data-icon="inline-end" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </Root>
  );
}
