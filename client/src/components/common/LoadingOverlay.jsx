import PropTypes from "prop-types";

function LoadingOverlay({ message = "Loading..." }) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 py-24 text-center text-slate-500">
      <svg
        className="h-12 w-12 animate-spin text-primary-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

LoadingOverlay.propTypes = {
  message: PropTypes.string,
};

export default LoadingOverlay;
