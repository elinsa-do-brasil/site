import { UserRound } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileForm } from "./profile-form";

type ProfileCardUser = {
  name?: string | null;
  image?: string | null;
};

export function ProfileCard({ user }: { user: ProfileCardUser }) {
  return (
    <Card className="rounded-md border-border/80 py-0 shadow-sm ring-1 ring-foreground/5">
      <CardHeader className="border-b bg-muted/30 py-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <UserRound className="size-4 text-elinsa-primary" />
          Perfil
        </CardTitle>
        <CardDescription>Nome e foto usados no portal.</CardDescription>
      </CardHeader>
      <CardContent className="py-4">
        <ProfileForm user={user} />
      </CardContent>
    </Card>
  );
}
