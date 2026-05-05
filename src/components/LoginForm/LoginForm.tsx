import {
  Field,
  Form,
  Formik,
  type FieldProps,
  type FormikHelpers,
} from 'formik'
import * as Yup from 'yup'
import { useEffect } from 'react'
import { FormInput } from '../FormInput/FormInput'
import { login, clearAuthError, selectAuthError, selectAuthStatus } from '../../features/auth/authSlice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import './LoginForm.css'

const loginSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email('Enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
})

export type LoginFormValues = Yup.InferType<typeof loginSchema>

export type LoginFormProps = {
  className?: string
  onLoginSuccess?: () => void
}

export function LoginForm({ className = '', onLoginSuccess }: LoginFormProps) {
  const dispatch = useAppDispatch()
  const submitError = useAppSelector(selectAuthError)
  const authStatus = useAppSelector(selectAuthStatus)

  useEffect(() => {
    return () => {
      dispatch(clearAuthError())
    }
  }, [dispatch])

  async function handleSubmit(
    values: LoginFormValues,
    { setSubmitting }: FormikHelpers<LoginFormValues>,
  ) {
    dispatch(clearAuthError())
    const result = await dispatch(
      login({ email: values.email.trim(), password: values.password }),
    )
    setSubmitting(false)
    if (login.fulfilled.match(result)) {
      onLoginSuccess?.()
    }
  }

  const isLoading = authStatus === 'loading'

  return (
    <Formik<LoginFormValues>
      initialValues={{ email: '', password: '' }}
      validationSchema={loginSchema}
      onSubmit={handleSubmit}
      validateOnBlur
      validateOnChange={false}
    >
      {({ isSubmitting }) => (
        <Form
          className={`login-form ${className}`.trim()}
          noValidate
          aria-describedby={submitError ? 'login-form-submit-error' : undefined}
        >
          {submitError ? (
            <div
              id="login-form-submit-error"
              className="login-form__banner"
              role="alert"
              aria-live="assertive"
            >
              {submitError}
            </div>
          ) : null}

          <Field name="email">
            {({ field, form }: FieldProps<string, LoginFormValues>) => (
              <FormInput
                id="login-email"
                label="Email"
                type="email"
                autoComplete="email"
                field={field}
                form={form}
              />
            )}
          </Field>

          <Field name="password">
            {({ field, form }: FieldProps<string, LoginFormValues>) => (
              <FormInput
                id="login-password"
                label="Password"
                type="password"
                autoComplete="current-password"
                field={field}
                form={form}
              />
            )}
          </Field>

          <button
            type="submit"
            className="login-form__submit"
            disabled={isSubmitting || isLoading}
            aria-busy={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </Form>
      )}
    </Formik>
  )
}
