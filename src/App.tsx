import { RegistrationForm } from "./components/registration/RegistrationForm";

export default function App() {
  return (
    <main style={{ maxWidth: "28rem", margin: "2rem auto", padding: "0 1rem" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1.25rem" }}>Create account</h1>
      <RegistrationForm />
    </main>
  );
}
