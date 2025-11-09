import { useMemo } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

import useAuthStore from "../../stores/useAuthStore";
import Button from "../common/Button";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/ideas", label: "Browse Ideas" },
  { to: "/post", label: "Post Idea" },
  { to: "/dashboard", label: "Dashboard" },
];

function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();

  const activePath = useMemo(() => location.pathname, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-primary-600">
          <span className="rounded bg-primary-600 px-2 py-1 text-sm font-bold uppercase tracking-widest text-white">
            IdeaConnect
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                [
                  "transition-colors duration-150 ease-out hover:text-primary-600",
                  isActive || activePath === link.to ? "text-primary-600" : "",
                ]
                  .filter(Boolean)
                  .join(" ")
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden flex-col text-right text-xs sm:flex">
                <span className="font-medium text-slate-900">{user?.fullName ?? "Explorer"}</span>
                <span className="text-slate-500">{user?.email}</span>
              </div>
              <Button variant="ghost" onClick={logout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button as={Link} to="/auth/login" variant="ghost">
                Log in
              </Button>
              <Button as={Link} to="/auth/register" variant="primary">
                Join Free
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
