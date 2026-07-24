interface BrandMarkProps {
  className?: string;
  /** Pixel size for compact uses (navbar). Ignored when filling a frame via CSS. */
  size?: number;
  /** Stretch to fill the parent frame */
  fill?: boolean;
}

/** BRANDIAYA logo image with rounded corners */
export function BrandMark({ className = "", size = 280, fill = false }: BrandMarkProps) {
  return (
    <img
      className={`brand-logo ${fill ? "brand-logo-fill" : ""} ${className}`.trim()}
      src="/brandiaya-logo.png"
      alt="BRANDIAYA"
      width={fill ? undefined : size}
      height={fill ? undefined : size}
      style={fill ? undefined : { width: size, height: size }}
    />
  );
}
