import PropTypes from "prop-types";

import Footer from "./Footer";
import Navbar from "./Navbar";

function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface text-slate-900 antialiased">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </main>
      <Footer />
    </div>
  );
}

AppLayout.propTypes = {
  children: PropTypes.node,
};

export default AppLayout;
