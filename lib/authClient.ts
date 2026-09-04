"use client";

// Cliente Better Auth no navegador — par da instância de servidor em lib/auth.ts.
import { passkeyClient } from "@better-auth/passkey/client";
import { emailOTPClient, organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [emailOTPClient(), organizationClient(), passkeyClient()],
});
