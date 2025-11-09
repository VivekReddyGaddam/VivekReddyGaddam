import PropTypes from "prop-types";
import { twMerge } from "tailwind-merge";

const colors = {
  primary: "bg-primary-50 text-primary-600 ring-primary-100",
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  success: "bg-emerald-50 text-emerald-600 ring-emerald-200",
  info: "bg-sky-50 text-sky-600 ring-sky-200",
};

function Badge({ children, color = "neutral", className }) {
  return (
    <span
      className={twMerge(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-widest ring-1 ring-inset",
        colors[color],
        className,
      )}
    >
      {children}
    </span>
  );
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.oneOf(["primary", "neutral", "success", "info"]),
  className: PropTypes.string,
};

export default Badge;
