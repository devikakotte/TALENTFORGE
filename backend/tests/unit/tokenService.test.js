const { durationToMs } = require('../../src/utils/tokenService');

describe('tokenService.durationToMs', () => {
  it('converts seconds', () => {
    expect(durationToMs('30s')).toBe(30 * 1000);
  });

  it('converts minutes', () => {
    expect(durationToMs('15m')).toBe(15 * 60 * 1000);
  });

  it('converts hours', () => {
    expect(durationToMs('2h')).toBe(2 * 60 * 60 * 1000);
  });

  it('converts days', () => {
    expect(durationToMs('7d')).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('falls back to 15 minutes for an unparseable string', () => {
    expect(durationToMs('garbage')).toBe(15 * 60 * 1000);
  });
});
