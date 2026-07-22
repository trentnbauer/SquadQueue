import { CONCRETE_SPIN_WHEEL_THEMES, type ConcreteSpinWheelTheme, type SpinWheelTheme } from '@queueup/shared';

/** Resolves "random" to one of the concrete themes - `random` isn't itself renderable, see
 * ConcreteSpinWheelTheme. The caller re-derives this on every spin (keyed on spinKey, same as the
 * winner pick), not just once per room-open, so picking "Random" stays a surprise across repeat
 * "Spin again" clicks too, instead of locking in whichever theme happened to load first. */
export function resolveConcreteTheme(theme: SpinWheelTheme, random: () => number = Math.random): ConcreteSpinWheelTheme {
  if (theme !== 'random') return theme;
  return CONCRETE_SPIN_WHEEL_THEMES[Math.floor(random() * CONCRETE_SPIN_WHEEL_THEMES.length)];
}
