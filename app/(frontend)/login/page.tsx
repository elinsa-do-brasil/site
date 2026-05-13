import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams: Promise<{
    redirectTo?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirectTo } = await searchParams;
  const target = redirectTo
    ? `/entrar?redirectTo=${encodeURIComponent(redirectTo)}`
    : "/entrar";
  redirect(target);
}
