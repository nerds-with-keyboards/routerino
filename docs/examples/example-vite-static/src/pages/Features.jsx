export default function Features() {
  const features = [
    { title: "Static HTML generation per route", icon: "📄" },
    { title: "Automatic meta tag injection", icon: "🏷️" },
    { title: "SEO optimization", icon: "🔍" },
    { title: "Fast initial page loads", icon: "⚡" },
    { title: "Works with dynamic routes too", icon: "🔄" },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-12">Features</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
          >
            <div className="card-body">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h2 className="card-title">{feature.title}</h2>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-12">
        <a href="/blog/getting-started" className="btn btn-primary btn-lg">
          Read the Blog Post
        </a>
      </div>
    </div>
  );
}
