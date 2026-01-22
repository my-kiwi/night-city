import { Counter } from './Counter';
import { GithubLink } from './GithubLink';

export const App = (): string => {
  return `
    <header>
      <h2>This is a simple vanilla TS seed</h2>
    </header>
    <main>
      ${Counter()}
    </main>
    <footer>
      ${GithubLink()}
    </footer>
    `;
};
