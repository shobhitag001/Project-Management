import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export function Button({
  className = "",
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  return <button className={`button ${variant} ${className}`} {...props} />;
}

export function Input({
  label,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} />
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}

export function Textarea({
  label,
  error,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea {...props} />
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}

export function Select({
  label,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select {...props}>{children}</select>
    </label>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="loading" role="status">
      <span className="spinner" />
      <span>{label}…</span>
    </div>
  );
}

export function EmptyState({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}

export function Badge({ value }: { value: string }) {
  return (
    <span className={`badge ${value.toLowerCase().replaceAll("_", "-")}`}>
      {value.replaceAll("_", " ")}
    </span>
  );
}
