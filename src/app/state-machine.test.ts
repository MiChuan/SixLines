import { describe, expect, it } from 'vitest';
import { initialState, reduce } from './state-machine';
import { sumToLine } from '../divination/coins';

const line = {
  ...sumToLine(7),
  coins: [true, true, false] as [boolean, boolean, boolean],
};

describe('ritual state machine', () => {
  it('progresses through six lines to complete', () => {
    let s = initialState();
    s = reduce(s, { type: 'START_LOAD' });
    expect(s.phase).toBe('loadingCoins');
    s = reduce(s, { type: 'LOAD_DONE' });
    expect(s.phase).toBe('ready');
    for (let i = 0; i < 6; i++) {
      s = reduce(s, { type: 'SHAKE' });
      s = reduce(s, { type: 'SHAKE_DONE', line });
      s = reduce(s, { type: 'LINE_ACK' });
    }
    expect(s.phase).toBe('complete');
    expect(s.casting?.primary).toBe(1);
  });
});
