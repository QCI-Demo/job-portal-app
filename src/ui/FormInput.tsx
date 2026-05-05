import type { FieldProps } from "formik";
import type { InputHTMLAttributes } from "react";

export type FormInputOwnProps = {
  label: string;
  id?: string;
  helperText?: string;
};

export type FormInputProps = FormInputOwnProps &
  FieldProps<string | undefined> &
  Omit<InputHTMLAttributes<HTMLInputElement>, keyof FieldProps<string | undefined> | keyof FormInputOwnProps>;

function fieldErrorMessage(error: unknown): string | undefined {
  if (typeof error === "string") return error;
  return undefined;
}

export function FormInput({
  field,
  form,
  meta,
  label,
  id: idProp,
  helperText,
  type = "text",
  className,
  ...inputProps
}: FormInputProps) {
  void meta;
  const id = idProp ?? field.name;
  const touched = form.touched[field.name];
  const submitCount = form.submitCount ?? 0;
  const errorRaw = form.errors[field.name];
  const errorMsg = fieldErrorMessage(errorRaw);
  const showError = Boolean(errorMsg && (touched || submitCount > 0));
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  const describedBy =
    [helperText ? helperId : null, showError ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className} style={{ marginBottom: "1rem" }}>
      <label
        htmlFor={id}
        style={{
          display: "block",
          fontWeight: 600,
          fontSize: "0.875rem",
          marginBottom: "0.35rem",
        }}
      >
        {label}
      </label>
      <input
        {...field}
        {...inputProps}
        id={id}
        type={type}
        aria-invalid={showError}
        aria-describedby={describedBy}
        style={{
          width: "100%",
          padding: "0.5rem 0.65rem",
          borderRadius: "6px",
          border: showError ? "2px solid #b42318" : "1px solid #c9cdd4",
          fontSize: "1rem",
          minHeight: "44px",
        }}
      />
      {helperText ? (
        <p id={helperId} style={{ margin: "0.35rem 0 0", fontSize: "0.8125rem", color: "#525862" }}>
          {helperText}
        </p>
      ) : null}
      {showError ? (
        <p
          id={errorId}
          role="alert"
          style={{ margin: "0.35rem 0 0", fontSize: "0.8125rem", color: "#b42318" }}
        >
          {errorMsg}
        </p>
      ) : null}
    </div>
  );
}
