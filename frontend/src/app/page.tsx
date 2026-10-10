import Image from "next/image";
import Link from "next/link";

const COLLAGE = [
  {
    src: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80",
    alt: "Cliente recibiendo un corte de cabello en la barbería",
  },
  {
    src: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80",
    alt: "Barbero realizando un arreglo de barba",
  },
  {
    src: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1200&q=80",
    alt: "Interior de una barbería moderna",
  },
  {
    src: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1200&q=80",
    alt: "Herramientas de barbería sobre la mesa de trabajo",
  },
];

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen w-full flex-1 items-center justify-center overflow-hidden">
      {/* Fondo de collage */}
      <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-4">
        {COLLAGE.map((imagen, index) => (
          <div key={imagen.src} className="relative">
            <Image
              src={imagen.src}
              alt={imagen.alt}
              fill
              priority={index === 0}
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Capa de contraste */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Contenido */}
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
        <h1 className="text-6xl font-black uppercase leading-none tracking-tighter text-white md:text-8xl lg:text-9xl">
          Siéntete bien. Mira bien.
        </h1>

        <p className="mt-8 max-w-2xl text-base text-white/90 md:text-lg">
          Reservá tu turno con los mejores barberos, elegí tu servicio y
          gestioná toda la experiencia desde un solo lugar. Precisión, estilo y
          buen ambiente.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/servicios"
            className="rounded-none border border-white px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-white hover:text-black">
            Ver servicios
          </Link>
          <Link
            href="/reservar"
            className="rounded-none bg-white px-8 py-4 text-sm font-bold uppercase tracking-widest text-black transition hover:bg-white/90">
            Reservar turno
          </Link>
        </div>
      </div>
    </div>
  );
}
