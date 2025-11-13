// src/components/DevLogin.tsx
export function DevLogin() {
  if (import.meta.env.PROD) return null;
  const params = new URLSearchParams({
    openId: "dev-user",
    name: "Dev User",
  });
  return (
    <a
      href={`/api/dev-login?${params.toString()}`}
      className="inline-flex items-center rounded bg-black px-3 py-2 text-white"
    >
      Dev Login
    </a>
  );
}
