import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Ingresar | Barbería" };

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-24 bg-surface">
      <div className="rounded-none border-2 bg-surface p-8 max-w-xl w-full">
        <h1 className="text-6xl font-black text-foreground uppercase tracking-widest mb-4">Ingresar</h1>
        <p className="mt-2 mb-8 text-sm text-muted">Accedé sin contraseña usando tu passkey.</p>
        <LoginForm />
      </div>
    </div>
  );
}
