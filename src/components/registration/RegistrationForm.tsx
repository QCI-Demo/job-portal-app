import axios from "axios";
import { Field, Form, Formik, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { FormInput } from "../../ui";

export type RegistrationValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const initialValues: RegistrationValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const validationSchema = Yup.object({
  name: Yup.string().trim().required("Name is required"),
  email: Yup.string().trim().email("Enter a valid email").required("Email is required"),
  password: Yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
});

export type RegistrationSuccessPayload = {
  token?: string;
  accessToken?: string;
  [key: string]: unknown;
};

function persistJwt(data: RegistrationSuccessPayload) {
  const token =
    typeof data.token === "string"
      ? data.token
      : typeof data.accessToken === "string"
        ? data.accessToken
        : undefined;
  if (token) {
    sessionStorage.setItem("auth_token", token);
  }
}

async function submitRegistration(
  values: RegistrationValues,
  helpers: FormikHelpers<RegistrationValues>,
) {
  helpers.setStatus(undefined);
  try {
    const { data } = await axios.post<RegistrationSuccessPayload>("/api/auth/register", {
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
    });
    persistJwt(data);
  } catch (err: unknown) {
    let message = "Registration failed. Please try again.";
    if (axios.isAxiosError(err)) {
      const body = err.response?.data as { message?: string; error?: string } | undefined;
      const serverMsg = typeof body?.message === "string" ? body.message : typeof body?.error === "string" ? body.error : undefined;
      if (serverMsg) message = serverMsg;
      else if (typeof err.message === "string" && err.message) message = err.message;
    }
    helpers.setStatus({ serverError: message });
  }
}

export function RegistrationForm() {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values, helpers) => {
        await submitRegistration(values, helpers);
      }}
    >
      {({ isSubmitting, status }) => (
        <Form noValidate aria-describedby={status?.serverError ? "registration-server-error" : undefined}>
          {status?.serverError ? (
            <div
              id="registration-server-error"
              role="alert"
              aria-live="assertive"
              style={{
                padding: "0.65rem 0.75rem",
                marginBottom: "1rem",
                borderRadius: "6px",
                backgroundColor: "#fef3f2",
                border: "1px solid #fecdca",
                color: "#7a271a",
                fontSize: "0.875rem",
              }}
            >
              {status.serverError}
            </div>
          ) : null}
          <Field
            name="name"
            id="registration-name"
            component={FormInput}
            label="Full name"
            autoComplete="name"
          />
          <Field
            name="email"
            id="registration-email"
            type="email"
            component={FormInput}
            label="Email"
            autoComplete="email"
            inputMode="email"
          />
          <Field
            name="password"
            id="registration-password"
            type="password"
            component={FormInput}
            label="Password"
            autoComplete="new-password"
          />
          <Field
            name="confirmPassword"
            id="registration-confirm-password"
            type="password"
            component={FormInput}
            label="Confirm password"
            autoComplete="new-password"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              marginTop: "0.25rem",
              padding: "0.65rem 1rem",
              minHeight: "44px",
              fontSize: "1rem",
              fontWeight: 600,
              color: "#fff",
              backgroundColor: isSubmitting ? "#98a2b3" : "#175cd3",
              border: "none",
              borderRadius: "6px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </Form>
      )}
    </Formik>
  );
}
