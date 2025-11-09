import { Link } from "react-router-dom";

import Button from "../components/common/Button";

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
      <span className="text-sm font-semibold uppercase tracking-widest text-primary-500">404</span>
      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Page not found</h1>
      <p className="max-w-md text-base text-slate-500">
        The page you are looking for might have been moved, removed, or renamed. Let’s get you back on track.
      </p>
      <Button variant="primary" as={Link} to="/">
        Go to Home
      </Button>
    </div>
  );
}

export default NotFoundPage;
