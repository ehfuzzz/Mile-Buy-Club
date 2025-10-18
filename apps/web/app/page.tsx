import styles from "./page.module.css";

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
    <main className={styles.main}>
      <section className={styles.hero}>
        <span className={styles.heroPill}>Mileage intelligence for frequent flyers</span>
        <h1 className={styles.heroTitle}>Find award flight deals automatically</h1>
        <p className={styles.heroDescription}>
          Mile Buy Club continuously watches your favorite programs, ranks mileage redemptions, and keeps your next trip within
          reach.
        </p>
        <div className={styles.actions}>
          <a href="/register" className={styles.primaryCta}>
            Get Started
          </a>
          <a href="/login" className={styles.secondaryCta}>
            Sign In
          </a>
        </div>
      </section>

      <section className={styles.features}>
        {features.map((feature) => (
          <article key={feature.title} className={styles.featureCard}>
            <h2 className={styles.featureTitle}>{feature.title}</h2>
            <p className={styles.featureCopy}>{feature.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
