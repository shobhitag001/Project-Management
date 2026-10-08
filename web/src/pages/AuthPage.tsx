import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "../auth/AuthContext";
import { ApiError } from "../lib/api";
import { Button, Input } from "../components/ui";

const formSchema = z.object({
  fullName: z.string().trim().max(100),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type FormValues = z.infer<typeof formSchema>;

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
    resolver: zodResolver(formSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  async function submit(values: FormValues) {
    setError("");
    if (registering && values.fullName.length < 2) {
      setError("Enter your full name.");
      return;
    }
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
