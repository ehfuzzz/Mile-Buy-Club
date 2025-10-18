export const metadata = {
  title: "Offline | Mile Buy Club"
};

export default function OfflineFallback() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        textAlign: "center",
        padding: "2rem"
      }}
    >
      <h1>Offline Mode</h1>
      <p>
        You&apos;re currently offline. We&apos;ll keep your place and refresh the latest deals once
        you reconnect.
      </p>
    </main>
  );
}
