import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

import Button from "../../components/common/Button";
import useAuthStore from "../../stores/useAuthStore";
import apiClient from "../../lib/apiClient";

function RegisterPage() {
  const navigate = useNavigate();
  const setCredentials = useAuthStore((state) => state.setCredentials);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      agreeToTerms: false,
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await apiClient.post("/auth/register", payload);
      return response.data;
    },
    onSuccess: (data) => {
      setCredentials({
        user: {
          email: data.user.email,
          fullName: data.user.full_name,
          id: data.user.id,
          isEmailVerified: data.user.is_email_verified,
        },
        tokens: {
          accessToken: data.tokens.access_token,
          refreshToken: data.tokens.refresh_token,
        },
      });
      navigate("/dashboard", { replace: true });
    },
  });

  const onSubmit = (formValues) => {
    registerMutation.mutate({
      full_name: formValues.fullName,
      email: formValues.email,
      password: formValues.password,
      agree_to_terms: formValues.agreeToTerms,
    });
  };

  const agreeToTermsValue = watch("agreeToTerms");

  return (
    <section className="mx-auto w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <header className="flex flex-col items-center gap-3 text-center">
        <Sparkles className="h-10 w-10 text-primary-500" />
        <h1 className="text-2xl font-bold text-slate-900">Create your IdeaConnect account</h1>
        <p className="text-sm text-slate-500">
          Free forever for core features. Upgrade only when you’re ready to scale.
        </p>
      </header>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Full name</span>
          <input
            {...register("fullName", { required: "We’d love to know your name" })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
          {errors.fullName ? <span className="text-xs text-rose-500">{errors.fullName.message}</span> : null}
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Email</span>
          <input
            type="email"
            {...register("email", { required: "Email helps us send notifications", pattern: /\S+@\S+\.\S+/ })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
          {errors.email ? <span className="text-xs text-rose-500">Enter a valid email</span> : null}
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Password</span>
          <input
            type="password"
            {...register("password", {
              required: "Set a secure password",
              minLength: { value: 8, message: "Minimum 8 characters" },
            })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
          <span className="text-xs text-slate-500">Must include at least one uppercase letter and a number.</span>
          {errors.password ? <span className="text-xs text-rose-500">{errors.password.message}</span> : null}
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <input type="checkbox" {...register("agreeToTerms", { required: true })} className="h-4 w-4 rounded border-slate-300" />
          I agree to the IdeaConnect Terms of Service and Community Guidelines.
        </label>
        {errors.agreeToTerms ? (
          <span className="text-xs text-rose-500">You’ll need to accept to continue.</span>
        ) : null}

        <Button type="submit" className="w-full" disabled={!agreeToTermsValue || registerMutation.isPending}>
          {registerMutation.isPending ? "Creating account..." : "Create account"}
        </Button>
        {registerMutation.isError ? (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
            We couldn’t create your account. Try again shortly or contact support.
          </p>
        ) : null}
      </form>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link className="font-semibold text-primary-600 hover:text-primary-700" to="/auth/login">
          Sign in
        </Link>
      </p>
    </section>
  );
}

export default RegisterPage;
