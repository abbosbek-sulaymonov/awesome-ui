import type { SVGProps } from "react";

function Icon({ children, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const AccessibilityIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}><circle cx="12" cy="4.5" r="1.6" /><path d="M4.5 8.5h15M12 8.5v6M12 14.5l-3 5M12 14.5l3 5" /></Icon>
);
export const FeatherIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}><path d="M20.2 3.8a5.5 5.5 0 0 0-7.8 0L4 12.2V20h7.8l8.4-8.4a5.5 5.5 0 0 0 0-7.8zM16 8 4.5 19.5" /></Icon>
);
export const PaletteIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}><circle cx="12" cy="12" r="9" /><circle cx="8.5" cy="10" r="1" /><circle cx="12" cy="7.5" r="1" /><circle cx="15.5" cy="10" r="1" /><path d="M12 21a3 3 0 0 1 0-6 2 2 0 0 0 2-2" /></Icon>
);
export const BoxIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}><path d="M21 8v8l-9 5-9-5V8l9-5z" /><path d="m3 8 9 5 9-5M12 13v8" /></Icon>
);
export const MoonIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></Icon>
);
export const SunIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></Icon>
);
export const TypeIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}><path d="M4 7V5h16v2M9 19h6M12 5v14" /></Icon>
);
export const CheckIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p} width="16" height="16"><path d="M20 6 9 17l-5-5" /></Icon>
);
export const CopyIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p} width="16" height="16"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></Icon>
);
export const GitHubIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p} width="18" height="18"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></Icon>
);
export const ArrowIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p} width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6" /></Icon>
);
