# Flight n' Fight

A pixel-art turn-based multiplayer fighting game where you pick a team of bird fighters and battle your opponent — online or against the computer.

## Game concept

Players assemble a team of **5 bird fighters** from a roster of 10 unique characters (Iris, Zephyr, Wendy, Skye, Sunny, Aura, Neil, Gale, Thora, Vega). Each fighter has stats — **HP, PWR, INT, DEF** — and a **type** (e.g. Dark, Fire, Electric…). The order you pick your team sets your fight sequence.

Battles are turn-based: each round your active fighter faces the opponent's active fighter in the centre of the arena. You choose to **Attack** or unleash a **Superpower** (costs stars). Fighters are defeated when HP reaches zero; the next fighter in your sequence steps in. The team that eliminates all five opponents wins.

### Modes

| Mode | Description |
| --- | --- |
| Single Player | Fight against a computer-controlled opponent |
| Multiplayer | Fight against another player online (WebSocket) |

## Tech stack

| Technology | Version |
| ---------- | ------- |
| Node.js    | ^24.x   |
| TypeScript | ^5.9    |
| Yarn       | ^1.22   |

Project's main dependencies are listed below.

| Dependency   | Version |
| -------      | ------- |
| Vite         | ^7.2    |
| React        | ^19.x   |
| Tailwind CSS | ^4.x    |
| Vitest       | ^4.x    |
| Playwright   | ^1.x    |
| Zod          | ^4.x    |
| Axios        | ^1.x    |
| Zustand      | ^5.x    |
| Storybook    | ^10.x   |

## Setting the project up

This app requires Node.js and Yarn. Follow these steps:

1. Install Node.js (v24.x or higher):
   - Download from [nodejs.org](https://nodejs.org/)
   - Use a version manager like [nvm](https://github.com/nvm-sh/nvm)

2. Install Yarn globally:

   ```shell
   npm install --global yarn@^1.22
   ```

3. Clone the repository:

   ```shell
   git clone <your-repository-url>
   cd flight-and-fight-game
   ```

4. Install dependencies:

   ```shell
   yarn install
   ```

## Running the project

```bash
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available scripts

```bash
yarn dev              # Start development server
yarn build            # Build for production
yarn preview          # Start production server (after build)
yarn test             # Run unit tests with Vitest
yarn test:coverage    # Run tests with coverage report
yarn e2e              # Run end-to-end tests with Playwright
yarn e2e:ui           # Run Playwright tests in UI mode
yarn lint             # Run Biome linter
yarn lint:fix         # Fix linting issues automatically
yarn storybook        # Run Storybook in development mode
yarn storybook:build  # Build Storybook for production
```

## Build

This project uses Vite and React Router for building and serving the application. The build process generates optimized static assets for production deployment.

Build the project with `yarn build` and preview the production build locally with `yarn preview`.

## Testing

This boilerplate includes both unit testing and end-to-end testing:

- **Unit Tests**: Uses Vitest with React Testing Library for component and utility testing
- **E2E Tests**: Uses Playwright for browser-based end-to-end testing

Run tests with:

```bash
yarn test              # Run unit tests
yarn test:coverage     # Run tests with coverage
yarn e2e               # Run E2E tests
yarn e2e:ui            # Run E2E tests in UI mode
```

## Linting

This boilerplate uses BiomeJS for code linting and formatting. Biome is a fast, all-in-one toolchain that replaces ESLint, Prettier, and other tools.

- **Linter**: BiomeJS provides fast linting with TypeScript support
- **Formatter**: Built-in code formatter with consistent style
- **Import Organization**: Automatic import sorting and organization

Run linting with:

```bash
yarn lint              # Check for linting issues
yarn lint:fix          # Automatically fix linting and formatting issues
```

The project is configured with custom linting rules in `biome.json`, including complexity checks, style rules, and correctness validations for TypeScript files.

## Visual testing

This boilerplate uses Storybook for visual testing and component development. Storybook provides an isolated environment to develop, test, and document UI components independently.

- **Component Development**: Build and test components in isolation
- **Visual Testing**: Preview components with different props and states
- **Documentation**: Auto-generate component documentation from stories
- **Addons**: Includes accessibility, docs, and Vitest integration addons

Run Storybook with:

```bash
yarn storybook        # Start Storybook development server (http://localhost:6006)
yarn storybook:build  # Build Storybook for production deployment
```

## Credits

 - [Sakura Girl](https://soundcloud.com/sakuragirl_official) - Soundtrack credits

## Resources

- [Vite Documentation](https://vite.dev/) - Vite build tool documentation
- [React Router Documentation](https://reactrouter.com/) - React Router framework documentation
- [React Documentation](https://react.dev/reference/react) - React.js reference
- [Learn React](https://react.dev/learn) - an interactive React.js tutorial
- [Tailwind CSS Documentation](https://tailwindcss.com/) - Tailwind CSS documentation
- [Vitest Documentation](https://vitest.dev/) - Vitest testing framework documentation
- [Playwright Documentation](https://playwright.dev/) - Playwright E2E testing documentation
- [BiomeJS Documentation](https://biomejs.dev/) - BiomeJS linter and formatter documentation
- [Storybook Documentation](https://storybook.js.org/) - Storybook component development and visual testing documentation
