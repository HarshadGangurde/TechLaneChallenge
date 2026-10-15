/** Decorative pixel cluster, echoing the turtle's shell. Purely visual. */
export function PixelDoodle({ className = "" }: { className?: string }) {
  const cells: [number, number, number, string][] = [
    [0, 28, 22, "#2c8441"], [30, 14, 18, "#14110f"], [54, 40, 26, "#2c8441"],
    [10, 0, 12, "#14110f"], [66, 8, 14, "#fff0c2"], [36, 52, 14, "#14110f"], [84, 36, 12, "#2c8441"],
  ];
  return (
    <svg aria-hidden viewBox="0 0 100 80" className={className} fill="none">
      {cells.map(([x, y, s, c], i) => (
        <rect key={i} x={x} y={y} width={s} height={s} rx="3" fill={c} stroke="#14110f" strokeWidth="2.5" />
      ))}
    </svg>
  );
}
