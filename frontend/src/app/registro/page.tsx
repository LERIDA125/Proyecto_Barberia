import { RegistroForm } from "@/components/auth/RegistroForm";

export const metadata = { title: "Crear cuenta | Barbería" };

export default function RegistroPage() {
  return (
    <div className="px-6 py-12 bg-surface max-w-md mx-auto">
      <div className="rounded-none border border-border bg-surface p-8 max-w-xl mx-auto mb-6">
        <h1 className="text-3xl font-black uppercase tracking-widest text-foreground mb-2">Crear cuenta</h1>
        <p className="text-sm text-muted mb-6">Registrate con una passkey: más rápido y sin contraseñas.</p>
        <RegistroForm />
      </div>
    </div>
  );
}