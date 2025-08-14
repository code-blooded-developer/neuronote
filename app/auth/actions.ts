"use server";
import { CredentialsSignin } from "next-auth";
import { hash } from "bcryptjs";
import crypto from "crypto";

import prisma from "@/lib/prisma";
import {
  SignInFormState,
  signInSchema,
  SignUpFormState,
  signUpSchema,
} from "@/lib/validation";
import { sendVerificationEmail } from "@/lib/mailer";

import { signIn, signOut } from "@/auth";

export async function signUpAction(
  _: SignUpFormState | undefined,
  formData: FormData
): Promise<SignUpFormState> {
  const data = {
    name: formData.get("name")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
    confirmPassword: formData.get("confirmPassword")?.toString() ?? "",
    agreeToTerms: formData.get("agreeToTerms") === "on",
  };

  const parsed = signUpSchema.safeParse(data);
  if (!parsed.success)
    return {
      ok: false,
      errors: parsed.error.flatten().fieldErrors,
      values: data,
    };

  const { name, email, password } = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists)
    return {
      ok: false,
      errors: { email: ["Email already in use"] },
      values: data,
    };

  const passwordHash = await hash(password, 12);
  await prisma.user.create({
    data: { name, email, passwordHash },
  });

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60);

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  await sendVerificationEmail(email, token);

  return {
    ok: true,
  };
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
      redirect: false,
    });

    return {
      ok: true,
    };
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
}

export async function signOutAction() {
  "use server";
  await signOut({ redirect: true });
}
