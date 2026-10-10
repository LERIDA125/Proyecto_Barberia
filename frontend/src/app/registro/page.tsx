import { RegistroForm } from "@/components/auth/RegistroForm";

export const metadata = { title: "Crear cuenta | Barbería" };

export default function RegistroPage() {
  return (
    <div className="px-6 py-12 bg-white max-w-md mx-auto">
      <div className="rounded-none border border-gray-200 bg-gray-50 p-8 max-w-xl mx-auto mb-6">
        <h1 className="text-3xl font-black uppercase tracking-widest text-slate-900 mb-2">Crear cuenta</h1>
        <p className="text-sm text-slate-600 mb-6">Registrate con una passkey: más rápido y sin contraseñas.</p>
        <RegistroForm />
      </div>
    </div>
  );
}