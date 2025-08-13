import { z } from "zod";

export const signUpSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name must be at most 50 characters long." }),
  email: z.email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .max(72, { message: "Password must be at most 72 characters long." })
    .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
    .regex(/[0-9]/, { message: "Contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Contain at least one special character.",
    }),
});

export const signInSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .max(72, { message: "Password must be at most 72 characters long." }),
});

export const forgotSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
});

export const resetSchema = z.object({
  token: z.string().min(10),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .max(72, { message: "Password must be at most 72 characters long." }),
});

export type SignUpFormState = z.infer<typeof signUpSchema>;
export type SignInFormState = {
  ok: boolean;
  errors?: {
    email?: string[];
    password?: string[];
    credentials?: string[];
  };
  values?: z.infer<typeof signInSchema>;
};
export type ForgotFormState = z.infer<typeof forgotSchema>;
export type ResetFormState = z.infer<typeof resetSchema>;
