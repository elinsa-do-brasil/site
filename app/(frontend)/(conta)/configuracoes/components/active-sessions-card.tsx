"use client";

import {
  Clock3,
  Laptop2,
  LocateFixed,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { revokeOtherSessionsAction, revokeSessionAction } from "../actions";

type SessionItem = {
  id: string;
  token: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  ipAddress: string | null;
  userAgent: string | null;
};

type ActiveSessionsCardProps = {
  initialSessions: SessionItem[];
  currentSessionToken: string | null;
};

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Não disponível";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function inferDevice(userAgent: string | null) {
  if (!userAgent) {
    return { label: "Dispositivo não identificado", icon: Laptop2 };
  }

  const normalized = userAgent.toLowerCase();
  if (
    normalized.includes("iphone") ||
    normalized.includes("android") ||
    normalized.includes("mobile")
  ) {
    return { label: "Dispositivo móvel", icon: Smartphone };
  }

  return { label: "Desktop / Notebook", icon: Laptop2 };
}

export function ActiveSessionsCard({
  initialSessions,
  currentSessionToken,
}: ActiveSessionsCardProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState(initialSessions);
  const [revokingToken, setRevokingToken] = useState<string | null>(null);
  const [isRevokingOthers, setIsRevokingOthers] = useState(false);
  const orderedSessions = useMemo(
    () =>
      [...sessions].sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() -
          new Date(left.updatedAt).getTime(),
      ),
    [sessions],
  );
  const otherSessions = orderedSessions.filter(
    (session) => session.token !== currentSessionToken,
  );

  async function handleRevokeSession(token: string) {
    setRevokingToken(token);
    const result = await revokeSessionAction(token);
    setRevokingToken(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setSessions((current) =>
      current.filter((session) => session.token !== token),
    );
    toast.success("Sessão revogada.");
    router.refresh();
  }

  async function handleRevokeOthers() {
    setIsRevokingOthers(true);
    const result = await revokeOtherSessionsAction();
    setIsRevokingOthers(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setSessions((current) =>
      current.filter((session) => session.token === currentSessionToken),
    );
    toast.success("Outras sessões revogadas.");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Laptop2 className="size-4" />
          Sessões ativas
        </CardTitle>
        <CardDescription>
          Revogue acessos antigos em outros dispositivos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/20 p-3">
          <div>
            <p className="font-medium">{orderedSessions.length} sessão ativa</p>
            <p className="text-muted-foreground">
              {otherSessions.length} em outros dispositivos.
            </p>
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={handleRevokeOthers}
            disabled={isRevokingOthers || otherSessions.length === 0}
          >
            {isRevokingOthers ? <Spinner /> : <RefreshCw className="size-4" />}
            Revogar outras
          </Button>
        </div>

        <div className="space-y-3">
          {orderedSessions.map((session) => {
            const device = inferDevice(session.userAgent);
            const DeviceIcon = device.icon;
            const isCurrent = session.token === currentSessionToken;

            return (
              <div className="rounded-md border p-3" key={session.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-2">
                    <p className="flex items-center gap-2 font-medium">
                      <DeviceIcon className="size-4 text-muted-foreground" />
                      {device.label}
                    </p>
                    <p className="break-all text-muted-foreground">
                      {session.userAgent || "Navegador não identificado"}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="size-3.5" />
                        {formatDateTime(session.updatedAt)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <LocateFixed className="size-3.5" />
                        {session.ipAddress || "IP não disponível"}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {isCurrent ? (
                      <Badge variant="secondary">
                        <ShieldCheck className="size-3" />
                        Atual
                      </Badge>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokeSession(session.token)}
                        disabled={revokingToken === session.token}
                      >
                        {revokingToken === session.token ? (
                          <Spinner />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                        Revogar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
