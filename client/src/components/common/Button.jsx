import PropTypes from "prop-types";
import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

const baseStyles =
  "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const variants = {
  primary: "bg-primary-600 text-white hover:bg-primary-700",
  secondary: "bg-white text-primary-600 ring-1 ring-inset ring-primary-200 hover:bg-primary-50",
  ghost: "text-slate-700 hover:bg-slate-100",
};

const Button = forwardRef(function Button(
  { as: Component = "button", className, variant = "primary", children, icon: Icon, iconPosition = "left", ...props },
  ref,
) {
  const iconElement =
    Icon &&
    (typeof Icon === "function" ? <Icon className="h-4 w-4" aria-hidden="true" /> : Icon);

  return (
    <Component ref={ref} className={twMerge(baseStyles, variants[variant], className)} {...props}>
      {iconElement && iconPosition === "left" ? <span className="mr-2">{iconElement}</span> : null}
      <span>{children}</span>
      {iconElement && iconPosition === "right" ? <span className="ml-2">{iconElement}</span> : null}
    </Component>
  );
});

Button.propTypes = {
  as: PropTypes.elementType,
  className: PropTypes.string,
  variant: PropTypes.oneOf(["primary", "secondary", "ghost"]),
  icon: PropTypes.oneOfType([PropTypes.func, PropTypes.element]),
  iconPosition: PropTypes.oneOf(["left", "right"]),
  children: PropTypes.node.isRequired,
};

export default Button;
