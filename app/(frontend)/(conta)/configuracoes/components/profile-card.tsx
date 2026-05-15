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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserRound className="size-4" />
          Perfil
        </CardTitle>
        <CardDescription>
          Atualize seu nome e a imagem exibida no menu da conta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProfileForm user={user} />
      </CardContent>
    </Card>
  );
}
