import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

/**
 * Flat config, run via the ESLint CLI (`eslint .`).
 *
 * Next.js 16 removed the `next lint` command, so the shared configs are now
 * composed directly instead of through `FlatCompat`. Type checking stays with
 * `tsc --noEmit` — the `lint` script runs both.
 */
const eslintConfig = [
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'] },
  ...nextCoreWebVitals,
  ...nextTypescript,

  /*
   * React Compiler rules, demoted to warnings.
   *
   * `eslint-config-next@16` turned these on as errors. They flag real patterns
   * worth fixing, but they fire on components that predate the upgrade (modals
   * seeding state from props in an effect, the embla carousel, the
   * notifications page). Left as errors they would fail `pnpm lint` — the
   * project's verification loop — on code untouched by the upgrade, which
   * turns a dependency bump into an unrelated refactor.
   *
   * Warning keeps them visible as tech debt at the strictness the project had
   * before Next 16. Promote them back to `error` once the flagged components
   * are cleaned up; `npx eslint . --quiet` lists what is left.
   */
  {
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/use-memo': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/incompatible-library': 'warn',
    },
  },
];

export default eslintConfig;
