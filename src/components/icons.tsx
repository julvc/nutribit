import type { SVGProps } from 'react'

function Svg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  )
}

/** Figura humana (señalética), como el brand mark. */
export function IconBody(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props} fill="currentColor" stroke="none">
      <circle cx="12" cy="4" r="2.2" />
      <path d="M14 7.2h-4c-1.1 0-2 .9-2 2v6h2v6.8h4V15.2h2v-6c0-1.1-.9-2-2-2z" />
    </Svg>
  )
}

export function IconPlate(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4" />
    </Svg>
  )
}

export function IconChart(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M5 20v-7" />
      <path d="M12 20V5" />
      <path d="M19 20v-10" />
    </Svg>
  )
}

export function IconPencil(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </Svg>
  )
}

export function IconTrash(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </Svg>
  )
}

export function IconPlus(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Svg>
  )
}

export function IconLogout(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </Svg>
  )
}

export function IconCoffee(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M17 8h1a3 3 0 0 1 0 6h-1" />
      <path d="M3 8h14v7a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
      <path d="M7 2v2M11 2v2" />
    </Svg>
  )
}

export function IconBowl(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M4 11h16a8 8 0 0 1-16 0z" />
      <path d="M9 4c-1 1.5 1 2 0 3.5M14 4c-1 1.5 1 2 0 3.5" />
    </Svg>
  )
}

export function IconMoon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M21 13A8.5 8.5 0 1 1 11 3a7 7 0 0 0 10 10z" />
    </Svg>
  )
}

export function IconSun(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Svg>
  )
}

export function IconApple(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M12 7c-1-2-3.5-2.5-5.5-1C4 7.8 3.6 11.6 5 15c1.2 3 3.2 5 5 5 .8 0 1.4-.4 2-.4s1.2.4 2 .4c1.8 0 3.8-2 5-5 1.4-3.4 1-7.2-1.5-9-2-1.5-4.5-1-5.5 1z" />
      <path d="M12 7c0-2 1-3.5 3-4" />
    </Svg>
  )
}

/** Marca: figura humana blanca sobre cuadrado redondeado verde pino. */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="var(--pine)" />
      <g fill="#fff" transform="translate(3.6 2.4) scale(0.7)">
        <circle cx="12" cy="4" r="2.4" />
        <path d="M14 7.2h-4c-1.1 0-2 .9-2 2v6h2v6.8h4V15.2h2v-6c0-1.1-.9-2-2-2z" />
      </g>
    </svg>
  )
}
