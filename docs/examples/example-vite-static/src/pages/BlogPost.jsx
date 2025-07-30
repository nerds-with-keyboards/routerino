import PropTypes from "prop-types";

export default function BlogPost({ routerinoParams }) {
  return (
    <div className="max-w-4xl mx-auto">
      <article className="prose lg:prose-xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">
          Blog Post {routerinoParams?.id}
        </h1>
        <div className="alert alert-warning mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>
            This is a dynamic route that won&apos;t be statically generated.
          </span>
        </div>
        <p className="text-lg">
          Dynamic routes like this one are perfect for content that changes
          frequently or requires real-time data. While they won&apos;t be
          pre-generated as static HTML, they still benefit from Routerino&apos;s
          SEO features when rendered on the client.
        </p>
        <div className="divider"></div>
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">Route Information</h2>
            <p>
              <strong>Route Pattern:</strong>{" "}
              <code className="badge badge-neutral">/blog/:id</code>
            </p>
            <p>
              <strong>Current ID:</strong>{" "}
              <code className="badge badge-primary">
                {routerinoParams?.id || "N/A"}
              </code>
            </p>
          </div>
        </div>
        <div className="mt-8">
          <a href="/features" className="btn btn-ghost">
            ← Back to Features
          </a>
        </div>
      </article>
    </div>
  );
}

BlogPost.propTypes = {
  routerinoParams: PropTypes.shape({
    id: PropTypes.string,
  }),
};
