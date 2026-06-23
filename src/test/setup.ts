import '@testing-library/jest-dom/vitest';

// Mock minimale di localStorage per i test in ambiente jsdom (già presente,
// ma garantiamo uno stato pulito tra i test).
import { afterEach } from 'vitest';

afterEach(() => {
  localStorage.clear();
});
