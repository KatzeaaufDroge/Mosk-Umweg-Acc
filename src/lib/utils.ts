export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getNavHeight(): number {
  return window.innerWidth < 640 ? 80 : 100;
}
