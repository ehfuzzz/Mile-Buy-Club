const features = [
  {
    title: "Real-time deal tracking",
    description: "Monitor award availability across top loyalty programs without manual refreshing."
  },
  {
    title: "Smart value scoring",
    description: "Understand the cents-per-point impact instantly with easy-to-read rankings."
  },
  {
    title: "Personalized alerts",
    description: "Get notified the moment flights match your preferences and mileage goals."
  }
];

export default function HomePage() {
  return (
    <main>
      <section className="hero-section">
        <span className="hero-pill">Mileage intelligence for frequent flyers</span>
        <h1 className="hero-title">Find award flight deals automatically</h1>
        <p className="hero-description">
          Mile Buy Club continuously watches your favorite programs, ranks mileage redemptions, and keeps your next trip within
          reach.
        </p>
        <div className="hero-actions">
          <a href="/register" className="button-primary">
            Get Started
          </a>
          <a href="/login" className="button-outline">
            Sign In
          </a>
        </div>
      </section>

      <section className="features-section">
        {features.map((feature) => (
          <article key={feature.title} className="feature-card">
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
