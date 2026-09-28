import { jumpTo } from './scroll';

export type SectionId = 'top' | 'about' | 'tools' | 'work' | 'contact';

type Handler = (id: SectionId) => void;

let transition: Handler | null = null;

/** The pixel transition registers itself here so any link can trigger it. */
export function registerSectionTransition(handler: Handler | null) {
  transition = handler;
}

/** Document offset for a section. Pinned sections expose a `data-nav-anchor` child. */
export function sectionOffset(id: SectionId) {
  if (id === 'top') return 0;
  const section = document.getElementById(id);
  if (!section) return 0;
  const anchor = section.querySelector<HTMLElement>('[data-nav-anchor]') ?? section;
  return Math.max(0, anchor.getBoundingClientRect().top + window.scrollY);
}

export function goToSection(id: SectionId) {
  if (transition) transition(id);
  else jumpTo(sectionOffset(id));
}
