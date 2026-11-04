import isotipoMarfil from "@/assets/images/isotipo-marfil.png";
import isotipoOliva from "@/assets/images/isotipo-oliva.png";
import logoMarfil from "@/assets/images/logo-marfil.png";
import logoOliva from "@/assets/images/logo-oliva.png";
import { cn } from "@/lib/cn";

type Tono = "marfil" | "oliva";

// Logo completo. `marfil` para fondos oscuros, `oliva` para claros.
export function Logo({
  tono = "oliva",
  className,
}: {
  tono?: Tono;
  className?: string;
}) {
  return (
    <img
      src={tono === "marfil" ? logoMarfil : logoOliva}
      alt="Arizona Health & Studio"
      className={cn("h-10 w-auto", className)}
    />
  );
}

// Solo la "A" de la marca.
export function Isotipo({
  tono = "oliva",
  className,
}: {
  tono?: Tono;
  className?: string;
}) {
  return (
    <img
      src={tono === "marfil" ? isotipoMarfil : isotipoOliva}
      alt=""
      aria-hidden="true"
      className={cn("h-8 w-auto", className)}
    />
  );
}
