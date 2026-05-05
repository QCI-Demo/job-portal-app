import { type HTMLInputTypeAttribute } from 'react'
import { type FieldInputProps, type FormikProps } from 'formik'

export type FormInputProps<T extends Record<string, unknown>> = {
  id: string
  label: string
  type?: HTMLInputTypeAttribute
  autoComplete?: string
  field: FieldInputProps<string>
  form: FormikProps<T>
}

/**
 * Accessible text input wired to Formik field metadata (label association, errors).
 */
export function FormInput<T extends Record<string, unknown>>({
  id,
  label,
  type = 'text',
  autoComplete,
  field,
  form,
}: FormInputProps<T>) {
  const { name, value, onChange, onBlur } = field
  const touched = form.touched[name]
  const rawError = form.errors[name]
  const errorText = typeof rawError === 'string' ? rawError : undefined
  const hasError = Boolean(touched && errorText)
  const errorId = `${id}-error`

  return (
    <div className="form-field">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        className={`form-input${hasError ? ' form-input--error' : ''}`}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
      />
      {hasError && errorText ? (
        <p id={errorId} className="form-error" role="alert">
          {errorText}
        </p>
      ) : null}
    </div>
  )
}
