function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 text-sm text-slate-500 sm:px-6 lg:px-8">
        <p>&copy; {new Date().getFullYear()} IdeaConnect. Built for founders, dreamers, and doers.</p>
        <div className="flex gap-4">
          <a href="/privacy" className="hover:text-primary-600">
            Privacy
          </a>
          <a href="/terms" className="hover:text-primary-600">
            Terms
          </a>
          <a href="/community" className="hover:text-primary-600">
            Community Guidelines
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
