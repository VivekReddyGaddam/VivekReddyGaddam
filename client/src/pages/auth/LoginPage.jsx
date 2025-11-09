import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Shield } from "lucide-react";

import Button from "../../components/common/Button";
import useAuthStore from "../../stores/useAuthStore";
import apiClient from "../../lib/apiClient";

function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setCredentials = useAuthStore((state) => state.setCredentials);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await apiClient.post("/auth/login", payload);
      return response.data;
    },
    onSuccess: (data) => {
      setCredentials({
        user: { email: data.user.email, fullName: data.user.full_name, id: data.user.id, isEmailVerified: data.user.is_email_verified },
        tokens: {
          accessToken: data.tokens.access_token,
          refreshToken: data.tokens.refresh_token,
        },
      });
      const redirectTo = searchParams.get("redirect") ?? "/dashboard";
      navigate(redirectTo, { replace: true });
    },
  });

  const onSubmit = (formValues) => {
    loginMutation.mutate(formValues);
  };

  return (
    <section className="mx-auto w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <header className="flex flex-col items-center gap-3 text-center">
        <Shield className="h-10 w-10 text-primary-500" />
        <h1 className="text-2xl font-bold text-slate-900">Welcome back to IdeaConnect</h1>
        <p className="text-sm text-slate-500">Log in to manage your ideas and respond to collaborators.</p>
      </header>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Email</span>
          <input
            type="email"
            {...register("email", { required: "Email is required" })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
          {errors.email ? <span className="text-xs text-rose-500">{errors.email.message}</span> : null}
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Password</span>
          <input
            type="password"
            {...register("password", { required: "Password is required" })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
          {errors.password ? <span className="text-xs text-rose-500">{errors.password.message}</span> : null}
        </label>

        <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Signing in..." : "Sign in"}
        </Button>

        {loginMutation.isError ? (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
            Invalid credentials. Double-check and try again.
          </p>
        ) : null}
      </form>

      <p className="text-center text-sm text-slate-500">
        Don’t have an account?{" "}
        <Link className="font-semibold text-primary-600 hover:text-primary-700" to="/auth/register">
          Create one for free
        </Link>
      </p>
    </section>
  );
}

export default LoginPage;
