import { Variants } from "framer-motion";

export const TRANSITION_SPRING_DEFAULT = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

export const SNAPPY = {
  type: "spring",
  stiffness: 500,
  damping: 40,
};

export const TAP_SCALE = 0.96;

export const FADE_VARIANTS: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const ITEM_VARIANTS: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const SLIDE_VARIANTS: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};
