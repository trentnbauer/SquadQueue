import type { Game } from '@queueup/shared';

/** The shared contract every Spin the Wheel theme component implements (issue #297) - winner
 * selection, the reveal panel (title/time-to-beat/actions), and the confetti celebration all live
 * once in SpinWheelModal, the shared dispatcher; a theme only owns its own pre-reveal animation.
 * `winner` is chosen once per spin by the dispatcher (not by the theme), so every theme animates
 * toward the same already-decided outcome rather than each re-implementing weighted selection. */
export interface SpinThemeProps {
  /** The full candidate pool, for a theme's own decorative filler (e.g. what else appears on the
   * reel/wheel/cards alongside the winner) - not necessarily all shown at once. */
  candidates: Game[];
  winner: Game;
  /** Changes on every spin ("Spin again" included) - a theme should treat this as its own re-run
   * signal (e.g. a useEffect dependency) to restart its animation from scratch. */
  spinKey: number;
  /** Called exactly once per spin, when the theme's own animation has finished and it's time for
   * the shared reveal panel + confetti to appear. */
  onRevealed: () => void;
}
