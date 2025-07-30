export default function About() {
  return (
    <div className="card bg-base-100 shadow-xl max-w-3xl mx-auto">
      <div className="card-body">
        <h1 className="card-title text-3xl text-primary mb-4">
          About Static Builds
        </h1>
        <p className="text-lg mb-4">
          Routerino can generate static HTML files for each route during build
          time.
        </p>
        <p className="text-lg">
          This improves SEO and initial page load performance.
        </p>
        <div className="alert alert-info mt-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>
            Static builds work great with CDNs and hosting platforms like
            Netlify, Vercel, and GitHub Pages.
          </span>
        </div>
      </div>
    </div>
  );
}
