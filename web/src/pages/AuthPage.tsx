import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "../auth/AuthContext";
import { ApiError } from "../lib/api";
import { Button, Input } from "../components/ui";

const emailSchema = z
  .string()
  .email("Enter a valid email address.")
  .max(254, "Email must be at most 254 characters.");
const utf8PasswordLimit = (value: string) =>
  new TextEncoder().encode(value).length <= 72;

const loginFormSchema = z.object({
  fullName: z.string(),
  email: emailSchema,
  password: z
    .string()
    .min(1, "Enter your password.")
    .max(72, "Password must be at most 72 characters.")
    .refine(utf8PasswordLimit, "Password must be at most 72 UTF-8 bytes."),
});

const registrationFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Enter your full name.")
    .max(100, "Full name must be at most 100 characters."),
  email: emailSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be at most 72 characters.")
    .regex(/[a-z]/, "Password must contain a lowercase letter.")
    .regex(/[A-Z]/, "Password must contain an uppercase letter.")
    .regex(/[0-9]/, "Password must contain a number.")
    .refine(utf8PasswordLimit, "Password must be at most 72 UTF-8 bytes."),
});

type FormValues = z.infer<typeof loginFormSchema>;

export function AuthPage() {
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState("");
  const { login, register, expiredMessage } = useAuth();
  const {
    register: field,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(
      registering ? registrationFormSchema : loginFormSchema,
    ),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  async function submit(values: FormValues) {
    setError("");
    try {
      if (registering) {
        await register(values.fullName, values.email, values.password);
      } else {
        await login(values.email, values.password);
      }
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Unable to continue.");
    }
  }

  function switchMode() {
    setRegistering((value) => !value);
    setError("");
    reset();
  }

  return (
    <div className="auth-page">
      <section className="auth-hero">
        <div className="brand light">
          <span className="brand-mark">
            <CheckCircle2 size={23} />
          </span>
          ProjectFlow
        </div>
        <div>
          <p className="eyebrow">Work better, together</p>
          <h1>Turn plans into progress.</h1>
          <p>
            Keep every project, task, and deadline in one calm, organized
            workspace—on web and mobile.
          </p>
        </div>
        <small>One account. Every device. Always in sync.</small>
      </section>
      <section className="auth-panel">
        <div className="auth-form">
          <p className="eyebrow">{registering ? "Get started" : "Welcome back"}</p>
          <h2>{registering ? "Create your account" : "Log in to your workspace"}</h2>
          <p className="muted">
            {registering
              ? "Use test data only for this demonstration."
              : "Enter your details to pick up where you left off."}
          </p>
          {(expiredMessage || error) && (
            <div className="alert error" role="alert">
              {error || expiredMessage}
            </div>
          )}
          <form onSubmit={handleSubmit(submit)}>
            {registering && (
              <Input
                label="Full name"
                autoComplete="name"
                placeholder="Alex Morgan"
                error={errors.fullName?.message}
                {...field("fullName")}
              />
            )}
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="alex@example.com"
              error={errors.email?.message}
              {...field("email")}
            />
            <Input
              label="Password"
              type="password"
              autoComplete={registering ? "new-password" : "current-password"}
              placeholder="At least 8 characters"
              error={errors.password?.message}
              {...field("password")}
            />
            <Button className="full-width" disabled={isSubmitting}>
              {isSubmitting
                ? "Please wait…"
                : registering
                  ? "Create account"
                  : "Log in"}
            </Button>
          </form>
          <p className="auth-switch">
            {registering ? "Already have an account?" : "New to ProjectFlow?"}{" "}
            <button type="button" onClick={switchMode}>
              {registering ? "Log in" : "Create an account"}
            </button>
          </p>
        </div>
      </section>
    </div>
  );
}
