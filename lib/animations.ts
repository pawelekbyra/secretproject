import { Transition, Variants } from 'framer-motion';

/**
 * Standard spring for application-like UI feedback.
 * Balanced between snappy and smooth.
 */
export const TRANSITION_SPRING_DEFAULT: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

/**
 * Snappier spring for fast interactions like toggles or small icons.
 */
export const TRANSITION_SPRING_SNAPPY: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
};

/**
 * Smooth modal spring for larger surface transitions.
 */
export const TRANSITION_SPRING_MODAL: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 40,
};

/**
 * Slow, elegant transition for background fades.
 */
export const TRANSITION_EASE_SMOOTH: Transition = {
  ease: [0.22, 1, 0.36, 1],
  duration: 0.6,
};

/**
 * Standard tap scale for unified interaction feedback.
 */
export const TAP_SCALE = 0.96;

/**
 * Modal variants: Scaling up from 0.95 with fade.
 */
export const MODAL_VARIANTS_SCALE: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

/**
 * Slide from right variants (standard for side panels).
 */
export const MODAL_VARIANTS_SLIDE_RIGHT: Variants = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
};

/**
 * Slide from left variants.
 */
export const MODAL_VARIANTS_SLIDE_LEFT: Variants = {
  initial: { x: '-100%' },
  animate: { x: 0 },
  exit: { x: '-100%' },
};

/**
 * Slide from bottom variants (standard for mobile-style sheets).
 */
export const MODAL_VARIANTS_SLIDE_UP: Variants = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
};

/**
 * Fade variants for overlays.
 */
export const FADE_VARIANTS: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Item entry variants for lists (staggered).
 */
export const ITEM_VARIANTS: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95 },
};
