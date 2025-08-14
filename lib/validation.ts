import { z } from "zod";

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters long." })
      .max(50, { message: "Name must be at most 50 characters long." }),
    email: z.email({ message: "Please enter a valid email address." }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long." })
      .max(72, { message: "Password must be at most 72 characters long." }),
    confirmPassword: z.string(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions.",
    }),
  })
  .superRefine((data, ctx) => {
    const { password, confirmPassword } = data;

    // Only run extra password checks if min and max length passed
    if (password.length >= 8 && password.length <= 72) {
      if (!/[A-Z]/.test(password)) {
        ctx.addIssue({
          path: ["password"],
          code: "custom",
          message: "Contain at least one uppercase letter.",
        });
        return;
      }
      if (!/[a-z]/.test(password)) {
        ctx.addIssue({
          path: ["password"],
          code: "custom",
          message: "Contain at least one lowercase letter.",
        });
        return;
      }
      if (!/[0-9]/.test(password)) {
        ctx.addIssue({
          path: ["password"],
          code: "custom",
          message: "Contain at least one number.",
        });
        return;
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        ctx.addIssue({
          path: ["password"],
          code: "custom",
          message: "Contain at least one special character.",
        });
        return;
      }
    }

    // Confirm password match
    if (password !== confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: "custom",
        message: "Passwords do not match.",
      });
      return;
    }
  });

export const signInSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .max(72, { message: "Password must be at most 72 characters long." }),
});

export const forgotPasswordSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .max(72, { message: "Password must be at most 72 characters long." }),
});

export type SignUpFormState = {
  ok: boolean;
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
    agreeToTerms?: string[];
    credentials?: string[];
  };
  values?: z.infer<typeof signUpSchema>;
};
export type SignInFormState = {
  ok: boolean;
  errors?: {
    email?: string[];
    password?: string[];
    credentials?: string[];
  };
  values?: z.infer<typeof signInSchema>;
};
export type ForgotPasswordFormState = {
  ok: boolean;
  errors?: {
    email?: string[];
  };
  values?: z.infer<typeof forgotPasswordSchema>;
};
export type ResetPasswordFormState = {
  ok: boolean;
  errors?: {
    token?: string[];
    password?: string[];
  };
  values?: z.infer<typeof resetPasswordSchema>;
};
