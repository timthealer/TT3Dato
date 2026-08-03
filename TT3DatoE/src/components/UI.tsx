import React from "react";
import { Colors } from "../theme";

export function Button({
  title,
  onClick,
  variant = "primary",
  disabled,
}: {
  title: string;
  onClick: () => void;
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
}) {
  const bg =
    variant === "primary"
      ? Colors.accent
      : variant === "danger"
      ? Colors.danger
      : Colors.surfaceAlt;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "12px 20px",
        borderRadius: 12,
        border: "none",
        background: bg,
        color: "#fff",
        fontWeight: 700,
        fontSize: 15,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
      }}
    >
      {title}
    </button>
  );
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: Colors.surface,
        borderRadius: 12,
        border: `1px solid ${Colors.border}`,
        padding: 16,
        marginBottom: 12,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Field({
  label,
  multiline,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label: string;
    multiline?: boolean;
  }) {
  const common = {
    background: Colors.surfaceAlt,
    borderRadius: 8,
    border: `1px solid ${Colors.border}`,
    padding: "11px 12px",
    color: Colors.text,
    fontSize: 15,
    width: "100%",
    outline: "none",
  };
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          color: Colors.textDim,
          fontSize: 13,
          marginBottom: 4,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      {multiline ? (
        <textarea
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          style={common}
        />
      ) : (
        <input
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          style={common}
        />
      )}
    </div>
  );
}
