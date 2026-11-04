export function BrandArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={className}
    >
      {/* arriba a la derecha */}
      <path
        d="M600 0V250C540 270 470 250 430 195C385 135 400 55 440 0Z"
        fill="var(--color-terracota-500)"
      />
      <path
        d="M600 0V120C570 135 535 125 520 100C505 72 515 28 535 0Z"
        fill="var(--color-marfil)"
        opacity="0.9"
      />
      {/* abajo a la derecha: el texto de marca queda libre sobre el oliva */}
      <path
        d="M600 900V700C530 688 455 728 430 795C415 835 428 875 450 900Z"
        fill="var(--color-marfil)"
        opacity="0.92"
      />
      <path
        d="M600 900V810C570 804 535 822 524 852C518 872 524 888 534 900Z"
        fill="var(--color-terracota-500)"
      />
    </svg>
  );
}
