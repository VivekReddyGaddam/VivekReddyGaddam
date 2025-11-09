import PropTypes from "prop-types";
import { useMemo } from "react";
import { Funnel, RefreshCcw } from "lucide-react";

import Button from "../common/Button";

const categories = [
  "SaaS/Business Software",
  "Consumer Apps",
  "E-commerce",
  "Healthcare Tech",
  "EdTech",
  "FinTech",
  "Marketplace",
  "Social/Community",
  "Hardware/IoT",
  "Web3/Crypto",
  "Gaming",
  "Sustainability",
  "B2B Services",
  "Creative/Media",
  "Other",
];

const stages = ["Idea Only", "Initial Research", "MVP Built", "Early Users", "Revenue Generating"];
const commitments = ["Part-time", "Full-time", "Flexible"];
const skills = ["Frontend Dev", "Backend Dev", "Product Designer", "Marketer", "Sales", "Data Analyst", "Other"];

function IdeaFilters({ filters, onChange, onReset }) {
  const handleChange = (key, value) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const appliedFiltersCount = useMemo(
    () =>
      ["category", "stage", "commitmentLevel", "skills"].reduce(
        (count, key) => (filters[key] && filters[key].length ? count + 1 : count),
        0,
      ),
    [filters],
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Funnel className="h-4 w-4 text-primary-500" />
          Filters {appliedFiltersCount > 0 ? `(${appliedFiltersCount})` : null}
        </div>
        <Button variant="ghost" className="text-xs" onClick={onReset} icon={RefreshCcw}>
          Reset
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Category
          <select
            value={filters.category}
            onChange={(e) => handleChange("category", e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Stage
          <select
            value={filters.stage}
            onChange={(e) => handleChange("stage", e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="">All Stages</option>
            {stages.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Commitment
          <select
            value={filters.commitmentLevel}
            onChange={(e) => handleChange("commitmentLevel", e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="">Any availability</option>
            {commitments.map((commitment) => (
              <option key={commitment} value={commitment}>
                {commitment}
              </option>
            ))}
          </select>
        </label>
        <label className="md:col-span-2 flex flex-col gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Skills Needed
          <select
            multiple
            value={filters.skills}
            onChange={(e) =>
              handleChange(
                "skills",
                Array.from(e.target.selectedOptions).map((option) => option.value),
              )
            }
            className="h-24 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            {skills.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Location Preference
          <input
            value={filters.location}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="Remote friendly, New York, etc."
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </label>
      </div>
    </div>
  );
}

IdeaFilters.propTypes = {
  filters: PropTypes.shape({
    category: PropTypes.string,
    stage: PropTypes.string,
    commitmentLevel: PropTypes.string,
    skills: PropTypes.arrayOf(PropTypes.string),
    location: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
};

export default IdeaFilters;
