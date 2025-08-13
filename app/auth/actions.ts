"use server";
import { CredentialsSignin } from "next-auth";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";
import { signUpSchema, signInSchema, SignInFormState } from "@/lib/validation";
import { signIn, signOut } from "@/auth";

export async function signUpAction(formData: FormData) {
  const data = Object.fromEntries(formData) as Record<string, string>;
  const parsed = signUpSchema.safeParse(data);
  if (!parsed.success)
    return { ok: false, errors: parsed.error.flatten().fieldErrors };

  const { name, email, password } = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { ok: false, errors: { email: ["Email already in use"] } };

  const passwordHash = await hash(password, 12);
  await prisma.user.create({ data: { name, email, passwordHash } });

  // Auto-login; you can pass a target with redirectTo
  await signIn("credentials", { email, password, redirectTo: "/" }); // v5 API
  return { ok: true };
}

export async function signInAction(
  _: SignInFormState | undefined,
  formData: FormData
): Promise<SignInFormState> {
  const data = {
    email: formData.get("email")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
  };

  const parsed = signInSchema.safeParse(data);
  if (!parsed.success)
    return {
      ok: false,
      errors: parsed.error.flatten().fieldErrors,
      values: data,
    };

  const { email, password } = parsed.data;

  try {
    await signIn("credentials", {
      email,
      password,
    });
  } catch (error: unknown) {
    console.error(
      error instanceof CredentialsSignin ? error.message : "Unexpected error"
    );
    return {
      ok: false,
      errors: {
        credentials: [
          error instanceof CredentialsSignin
            ? error.message.replace(/\. Read more.*/i, "")
            : "Unexpected error",
        ],
      },
      values: data,
    };
  }

  return { ok: true };
}

export async function signOutAction() {
  "use server";
  await signOut({ redirect: true });
}
