import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Flame } from "lucide-react";

import IdeaCard from "../../components/ideas/IdeaCard";
import IdeaFilters from "../../components/ideas/IdeaFilters";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import apiClient from "../../lib/apiClient";

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
  { label: "Part-time", value: "part_time" },
  { label: "Full-time", value: "full_time" },
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

const sortOptions = [
  { label: "Newest First", value: "newest" },
  { label: "Most Upvotes", value: "most_upvotes" },
  { label: "Most Comments", value: "most_comments" },
  { label: "Most Interested", value: "most_interested" },
  { label: "Oldest First", value: "oldest" },
];

function IdeasFeedPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    category: "",
    stage: "",
    commitmentLevel: "",
    skills: [],
    location: "",
    sort: "newest",
    search: "",
  });

  const queryParams = useMemo(() => {
    const params = {
      page,
      limit: 20,
      sort: filters.sort,
    };

    if (filters.category) {
      params.category = categoryOptions.find((option) => option.label === filters.category)?.value ?? filters.category;
    }
    if (filters.stage) {
      params.stage = stageOptions.find((option) => option.label === filters.stage)?.value ?? filters.stage;
    }
    if (filters.commitmentLevel) {
      params.commitment_level =
        commitmentOptions.find((option) => option.label === filters.commitmentLevel)?.value ??
        filters.commitmentLevel;
    }
    if (filters.skills?.length) {
      params.skills = filters.skills
        .map((skill) => skillsOptions.find((option) => option.label === skill)?.value ?? skill)
        .filter(Boolean);
    }
    if (filters.location) {
      params.location = filters.location;
    }
    if (filters.search) {
      params.search = filters.search;
    }
    return params;
  }, [filters, page]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["ideas", queryParams],
    queryFn: async () => {
      const response = await apiClient.get("/ideas", { params: queryParams });
      return response.data;
    },
    keepPreviousData: true,
  });

  const mappedIdeas =
    data?.items?.map((idea) => ({
      id: idea.id,
      title: idea.title,
      description: idea.description,
      categoryLabel: categoryOptions.find((option) => option.value === idea.category)?.label ?? idea.category,
      skillsNeeded:
        idea.skills_needed?.map(
          (skill) => skillsOptions.find((option) => option.value === skill)?.label ?? skill,
        ) ?? [],
      upvoteCount: idea.upvote_count,
      commentCount: idea.comment_count,
      interestedCount: idea.interested_count,
      createdAt: idea.created_at,
    })) ?? [];

  return (
    <section className="space-y-10">
      <header className="flex flex-col gap-4">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">
          <Flame className="h-4 w-4" />
          Open Idea Feed
        </span>
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Discover what founders are building next</h1>
        <p className="max-w-2xl text-base text-slate-600">
          Filter ideas by industry, stage, commitment, and skills to find the projects that match your energy. Click "I'm
          Interested" to start collaborating instantly.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={filters.search}
            onChange={(event) => {
              setPage(1);
              setFilters((prev) => ({
                ...prev,
                search: event.target.value,
              }));
            }}
            placeholder="Search ideas by title or description..."
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 sm:w-96"
          />
        </div>
      </header>

      <IdeaFilters
        filters={filters}
        onChange={(updatedFilters) => {
          setPage(1);
          setFilters(updatedFilters);
        }}
        onReset={() => {
          setFilters({
            category: "",
            stage: "",
            commitmentLevel: "",
            skills: [],
            location: "",
            sort: "newest",
            search: "",
          });
          setPage(1);
          refetch();
        }}
      />

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-700">{mappedIdeas.length}</span> ideas
          {data?.total ? (
            <>
              {" "}
              • <span className="font-semibold text-slate-700">{data.total}</span> total matches
            </>
          ) : null}
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-500">
          Sort by
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
            value={filters.sort}
            onChange={(event) => setFilters((prev) => ({ ...prev, sort: event.target.value }))}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isLoading ? (
        <LoadingOverlay message="Curating the best idea matches..." />
      ) : isError ? (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          <AlertCircle className="h-5 w-5" />
          Something went wrong loading ideas. Please try again.
        </div>
      ) : mappedIdeas.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-20 text-center">
          <h3 className="text-xl font-semibold text-slate-700">No ideas match your filters yet.</h3>
          <p className="max-w-md text-sm text-slate-500">
            Try broadening your filters, or check back soon as new ideas are posted every hour during beta.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {mappedIdeas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </section>
  );
}

export default IdeasFeedPage;
