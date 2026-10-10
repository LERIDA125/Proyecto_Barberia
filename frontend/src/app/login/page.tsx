import Image from "next/image";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Ingresar | Barbería" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full">
      <div className="relative hidden w-1/2 lg:block">
        <Image
          src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1400&q=80"
          alt="Interior de barbería"
          fill
          priority
          sizes="50vw"
          className="object-cover grayscale"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="flex w-full items-center justify-center bg-neutral-950 px-8 py-24 lg:w-1/2">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-medium tracking-tight text-white">Ingresar</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Accedé sin contraseña usando tu passkey.
          </p>
          <div className="mt-10">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
