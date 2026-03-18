import { capitalize, formatErrorMessage, isEmptyString, lazyRequire, truncate } from '../../src/utils';

describe('capitalize', () => {
  it('capitalizes first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('lowercases remaining letters', () => {
    expect(capitalize('WORLD')).toBe('World');
  });
});

describe('truncate', () => {
  it('returns string unchanged when within limit', () => {
    expect(truncate('short', 10)).toBe('short');
  });

  it('appends ellipsis when exceeding limit', () => {
    expect(truncate('hello world', 5)).toBe('hello...');
  });
});

describe('isEmptyString', () => {
  it('returns true for blank string', () => {
    expect(isEmptyString('   ')).toBe(true);
  });

  it('returns false for non-blank string', () => {
    expect(isEmptyString('hello')).toBe(false);
  });
});

describe('lazyRequire', () => {
  it('returns the same module instance on repeated calls', () => {
    const getModule = lazyRequire<{ default: string }>('react');
    const first = getModule();
    const second = getModule();
    expect(first).toBe(second);
  });

  it('throws if the module does not exist', () => {
    const getBad = lazyRequire('__non_existent_module_12345__');
    expect(() => getBad()).toThrow();
  });
});

describe('formatErrorMessage', () => {
  it('extracts message from Error instance', () => {
    expect(formatErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('returns string directly', () => {
    expect(formatErrorMessage('oops')).toBe('oops');
  });

  it('returns fallback for unknown types', () => {
    expect(formatErrorMessage(42)).toBe('An unexpected error occurred');
  });
});
