import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios, { AxiosError, type AxiosResponse } from "axios";
import { vi } from "vitest";
import { RegistrationForm } from "./RegistrationForm";

vi.mock("axios", async (importActual) => {
  const actual = await importActual<typeof import("axios")>();
  return {
    ...actual,
    default: {
      ...actual.default,
      post: vi.fn(),
    },
  };
});

describe("RegistrationForm", () => {
  beforeEach(() => {
    vi.mocked(axios.post).mockReset();
    sessionStorage.clear();
  });

  it("posts trimmed name and email to register endpoint on valid submit", async () => {
    const user = userEvent.setup();
    vi.mocked(axios.post).mockResolvedValueOnce({ data: { token: "jwt-example" } });

    render(<RegistrationForm />);

    await user.type(screen.getByLabelText(/full name/i), "  Jane Doe  ");
    await user.type(screen.getByLabelText(/^email$/i), "  jane@example.com  ");
    await user.type(screen.getByLabelText(/^password$/i), "password12");
    await user.type(screen.getByLabelText(/confirm password/i), "password12");

    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/auth/register", {
        name: "Jane Doe",
        email: "jane@example.com",
        password: "password12",
      });
    });

    expect(sessionStorage.getItem("auth_token")).toBe("jwt-example");
  });

  it("shows Yup validation errors when fields are empty", async () => {
    const user = userEvent.setup();
    render(<RegistrationForm />);

    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("shows server error message when registration fails", async () => {
    const user = userEvent.setup();
    const response: AxiosResponse<{ message: string }> = {
      data: { message: "Email already registered" },
      status: 409,
      statusText: "Conflict",
      headers: {},
      config: {} as never,
    };
    const err = new AxiosError<{ message: string }>("Request failed");
    err.response = response;
    vi.mocked(axios.post).mockRejectedValueOnce(err);

    render(<RegistrationForm />);

    await user.type(screen.getByLabelText(/full name/i), "Jane Doe");
    await user.type(screen.getByLabelText(/^email$/i), "jane@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password12");
    await user.type(screen.getByLabelText(/confirm password/i), "password12");

    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/email already registered/i)).toBeInTheDocument();
  });
});
