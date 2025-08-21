"use server";

import { signIn, signOut } from "@/auth";
import { compare, hash } from "bcryptjs";
import crypto from "crypto";
import { CredentialsSignin } from "next-auth";

import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/mailer";
import prisma from "@/lib/prisma";
import {
  ForgotPasswordFormState,
  ResetPasswordFormState,
  SignInFormState,
  SignUpFormState,
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/validation";

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

export async function forgotPasswordAction(
  _: ForgotPasswordFormState | undefined,
  formData: FormData
): Promise<ForgotPasswordFormState> {
  const data = {
    email: formData.get("email")?.toString() ?? "",
  };

  const parsed = forgotPasswordSchema.safeParse(data);
  if (!parsed.success)
    return {
      ok: false,
      errors: parsed.error.flatten().fieldErrors,
      values: data,
    };

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { ok: true };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.upsert({
    where: { email },
    update: { token, expires },
    create: { email, token, expires },
  });

  await sendPasswordResetEmail(email, token);

  return {
    ok: true,
  };
}

export async function resetPasswordAction(
  _: ResetPasswordFormState | undefined,
  formData: FormData
): Promise<ResetPasswordFormState> {
  const data = {
    token: formData.get("token")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
    confirmPassword: formData.get("confirmPassword")?.toString() ?? "",
  };

  const parsed = resetPasswordSchema.safeParse(data);
  if (!parsed.success)
    return {
      ok: false,
      errors: parsed.error.flatten().fieldErrors,
      values: data,
    };

  const { token, password } = parsed.data;
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken || resetToken.expires < new Date()) {
    return {
      ok: false,
      errors: { token: ["Invalid or expired reset link"] },
      values: data,
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: resetToken.email },
  });
  if (!user) {
    return {
      ok: false,
      errors: { token: ["Invalid or expired token"] },
      values: data,
    };
  }

  const isSameAsOld =
    user.passwordHash && (await compare(password, user.passwordHash));
  if (isSameAsOld) {
    return {
      ok: false,
      errors: {
        token: ["New password cannot be the same as the old password"],
      },
      values: data,
    };
  }

  const passwordHash = await hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  await prisma.passwordResetToken.delete({
    where: { token },
  });

  return {
    ok: true,
  };
}

export async function signOutAction() {
  "use server";
  await signOut({ redirect: true });
}
