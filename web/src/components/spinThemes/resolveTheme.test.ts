import { describe, it, expect } from 'vitest';
import { resolveConcreteTheme } from './resolveTheme';

describe('resolveConcreteTheme', () => {
  it('passes a concrete theme through unchanged, ignoring the random source', () => {
    expect(resolveConcreteTheme('slot', () => 0.99)).toBe('slot');
    expect(resolveConcreteTheme('crate', () => 0)).toBe('crate');
    expect(resolveConcreteTheme('card_flip', () => 0.5)).toBe('card_flip');
    expect(resolveConcreteTheme('roulette', () => 0.5)).toBe('roulette');
  });

  it('resolves "random" using the given random source, spanning the full concrete list', () => {
    expect(resolveConcreteTheme('random', () => 0)).toBe('slot');
    expect(resolveConcreteTheme('random', () => 0.99)).toBe('roulette');
  });

  it('never resolves "random" to "random" itself across many draws', () => {
    for (let i = 0; i < 50; i++) {
      const result = resolveConcreteTheme('random', () => i / 50);
      expect(result).not.toBe('random');
    }
  });
});
