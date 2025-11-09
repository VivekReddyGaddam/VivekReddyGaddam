import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Sparkle, CheckCircle2 } from "lucide-react";

import Button from "../../components/common/Button";
import useAuthStore from "../../stores/useAuthStore";
import apiClient from "../../lib/apiClient";

const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 2000;
const MIN_DESCRIPTION_LENGTH = 20;

const categoryOptions = [
  { label: "SaaS/Business Software", value: "saas_business_software" },
  { label: "Consumer Apps", value: "consumer_apps" },
  { label: "E-commerce", value: "ecommerce" },
  { label: "Healthcare Tech", value: "healthcare_tech" },
  { label: "EdTech", value: "edtech" },
  { label: "FinTech", value: "fintech" },
  { label: "Marketplace", value: "marketplace" },
  { label: "Social/Community", value: "social_community" },
  { label: "Hardware/IoT", value: "hardware_iot" },
  { label: "Web3/Crypto", value: "web3_crypto" },
  { label: "Gaming", value: "gaming" },
  { label: "Sustainability", value: "sustainability" },
  { label: "B2B Services", value: "b2b_services" },
  { label: "Creative/Media", value: "creative_media" },
  { label: "Other", value: "other" },
];

const stageOptions = [
  { label: "Idea Only", value: "idea_only" },
  { label: "Initial Research", value: "initial_research" },
  { label: "MVP Built", value: "mvp_built" },
  { label: "Early Users", value: "early_users" },
  { label: "Revenue Generating", value: "revenue_generating" },
];

const commitmentOptions = [
  { label: "Part-time (5-10 hrs/week)", value: "part_time" },
  { label: "Full-time (40+ hrs/week)", value: "full_time" },
  { label: "Flexible", value: "flexible" },
];

const skillsOptions = [
  { label: "Frontend Dev", value: "frontend_dev" },
  { label: "Backend Dev", value: "backend_dev" },
  { label: "Product Designer", value: "product_designer" },
  { label: "Marketer", value: "marketer" },
  { label: "Sales", value: "sales" },
  { label: "Data Analyst", value: "data_analyst" },
  { label: "Other", value: "other" },
];

function IdeaPostingPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [submittedIdea, setSubmittedIdea] = useState(null);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      category: "",
      stage: "",
      commitmentLevel: "",
      skillsNeeded: [],
      location: "",
      email: user?.email ?? "",
      isAnonymous: false,
    },
  });

  const descriptionValue = watch("description");
  const titleValue = watch("title");

  const ideaMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await apiClient.post("/ideas", payload);
      return response.data;
    },
    onSuccess: (data) => {
      setSubmittedIdea(data);
      reset({
        title: "",
        description: "",
        category: "",
        stage: "",
        commitmentLevel: "",
        skillsNeeded: [],
        location: "",
        email: user?.email ?? "",
        isAnonymous: false,
      });
    },
  });

  const onSubmit = (formValues) => {
    const payload = {
      title: formValues.title.trim(),
      description: formValues.description.trim(),
      category: formValues.category,
      stage: formValues.stage,
      commitment_level: formValues.commitmentLevel,
      skills_needed: formValues.skillsNeeded,
      location: formValues.location.trim() || null,
      is_anonymous: formValues.isAnonymous,
      email: isAuthenticated ? user?.email : formValues.email.trim(),
    };
    ideaMutation.mutate(payload);
  };

  const shareLink = useMemo(() => {
    if (!submittedIdea) return null;
    return `${window.location.origin}/ideas/${submittedIdea.id}`;
  }, [submittedIdea]);

  return (
    <section className="space-y-10">
      <header className="flex flex-col gap-4">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
          <Sparkle className="h-4 w-4" />
          Post in 30 seconds
        </span>
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Your idea deserves to be seen</h1>
        <p className="max-w-2xl text-base text-slate-600">
          Share your concept anonymously (or proudly), collect interest instantly, and convert collaborators without the
          friction of traditional platforms.
        </p>
      </header>

      {submittedIdea ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-700">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6" />
            <div>
              <h2 className="text-lg font-semibold">Your idea is live!</h2>
              <p className="text-sm">
                Share your link and invite collaborators. We’ve emailed you next steps on growing traction.
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-white p-4 text-sm text-slate-700 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">{submittedIdea.title}</span>
              {shareLink ? (
                <a
                  href={shareLink}
                  className="text-primary-600 hover:text-primary-700"
                  target="_blank"
                  rel="noreferrer"
                >
                  View live idea
                </a>
              ) : null}
            </div>
            {shareLink ? (
              <div className="mt-2 overflow-hidden text-ellipsis rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                {shareLink}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2"
      >
        <div className="space-y-6 md:col-span-2">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Idea Title <span className="text-rose-500">*</span>
            </span>
            <input
              {...register("title", {
                required: "A title is required",
                maxLength: { value: MAX_TITLE_LENGTH, message: "Title must be under 120 characters" },
              })}
              placeholder="What are you building?"
              className="rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>{MAX_TITLE_LENGTH - titleValue.length} characters remaining</span>
              {errors.title ? <span className="text-rose-500">{errors.title.message}</span> : null}
            </div>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Describe your idea <span className="text-rose-500">*</span>
            </span>
            <textarea
              {...register("description", {
                required: "A description is required",
                minLength: {
                  value: MIN_DESCRIPTION_LENGTH,
                  message: "Tell us a bit more—minimum 20 characters",
                },
                maxLength: { value: MAX_DESCRIPTION_LENGTH, message: "Keep it under 2,000 characters" },
              })}
              rows={6}
              placeholder="What problem do you solve? What's unique? What help do you need?"
              className="rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>
                {descriptionValue.length}/{MAX_DESCRIPTION_LENGTH}
              </span>
              {errors.description ? <span className="text-rose-500">{errors.description.message}</span> : null}
            </div>
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Category <span className="text-rose-500">*</span>
          </span>
          <select
            {...register("category", { required: "Select a category" })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="">Choose category</option>
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.category ? <span className="text-xs text-rose-500">{errors.category.message}</span> : null}
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Stage <span className="text-rose-500">*</span>
          </span>
          <select
            {...register("stage", { required: "Select your stage" })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="">Where are you now?</option>
            {stageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.stage ? <span className="text-xs text-rose-500">{errors.stage.message}</span> : null}
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Commitment Level <span className="text-rose-500">*</span>
          </span>
          <select
            {...register("commitmentLevel", { required: "Tell collaborators what to expect" })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="">Select your ideal commitment</option>
            {commitmentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.commitmentLevel ? (
            <span className="text-xs text-rose-500">{errors.commitmentLevel.message}</span>
          ) : null}
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Location Preference</span>
          <input
            {...register("location")}
            placeholder='e.g., "Remote OK", "NYC preferred"'
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </label>

        <label className="md:col-span-2 flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Skills Needed (optional)
          </span>
          <div className="grid gap-3 sm:grid-cols-3">
            {skillsOptions.map((skill) => (
              <label
                key={skill.value}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:border-primary-300 hover:bg-primary-50"
              >
                <input
                  type="checkbox"
                  value={skill.value}
                  {...register("skillsNeeded")}
                  className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                {skill.label}
              </label>
            ))}
          </div>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Email for notifications <span className="text-rose-500">*</span>
          </span>
          <input
            {...register("email", {
              required: !isAuthenticated ? "Email is required so we can notify you" : false,
              pattern: { value: /\S+@\S+\.\S+/, message: "Enter a valid email" },
            })}
            type="email"
            disabled={isAuthenticated}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:bg-slate-100"
          />
          <span className="text-xs text-slate-400">
            We keep this private and only use it to alert you about interest or comments.
          </span>
          {errors.email ? <span className="text-xs text-rose-500">{errors.email.message}</span> : null}
        </label>

        <label className="flex items-center gap-3 md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <input type="checkbox" {...register("isAnonymous")} className="h-4 w-4 rounded border-slate-300" />
          Post anonymously (your idea will show as “Posted by Anonymous”). You can reveal your profile later.
        </label>

        <div className="md:col-span-2 flex flex-col gap-3">
          <Button type="submit" disabled={ideaMutation.isPending} className="w-full sm:w-auto">
            {ideaMutation.isPending ? "Publishing..." : "Publish Idea"}
          </Button>
          {ideaMutation.isError ? (
            <p className="text-sm text-rose-500">
              Something went wrong while posting your idea. Please try again or contact support.
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}

export default IdeaPostingPage;
