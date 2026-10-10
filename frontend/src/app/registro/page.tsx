import Image from "next/image";
import { RegistroForm } from "@/components/auth/RegistroForm";

export const metadata = { title: "Crear cuenta | Barbería" };

export default function RegistroPage() {
  return (
    <div className="flex min-h-screen w-full">
      <div className="flex w-full items-center justify-center bg-neutral-950 px-8 py-24 lg:w-1/2">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-medium tracking-tight text-white">Crear cuenta</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Registrate con una passkey: más rápido y sin contraseñas.
          </p>
          <div className="mt-10">
            <RegistroForm />
          </div>
        </div>
      </div>

      <div className="relative hidden w-1/2 lg:block">
        <Image
          src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1400&q=80"
          alt="Herramientas de barbería"
          fill
          priority
          sizes="50vw"
          className="object-cover grayscale"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>
    </div>
  );
}
