export const TRANSITION_SPRING_DEFAULT = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export const TRANSITION_SPRING_SNAPPY = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
};

export const TRANSITION_SPRING_MODAL = {
  type: 'spring',
  stiffness: 400,
  damping: 40,
};

export const TRANSITION_EASE_SMOOTH = {
  ease: [0.22, 1, 0.36, 1],
  duration: 0.6,
};

export const TAP_SCALE = 0.96;

export const MODAL_VARIANTS_SCALE = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const MODAL_VARIANTS_SLIDE_RIGHT = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
};

export const MODAL_VARIANTS_SLIDE_LEFT = {
  initial: { x: '-100%' },
  animate: { x: 0 },
  exit: { x: '-100%' },
};

export const MODAL_VARIANTS_SLIDE_UP = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
};

export const FADE_VARIANTS = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const ITEM_VARIANTS = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95 },
};
