# Contributing

Thank you for your interest in contributing! This guide will help you get started.

## Issues

Issues are valuable to this project. You can open issues for:

- **Bug reports** - Help us identify problems and improve stability
- **Feature requests** - Share ideas for new functionality or improvements
- **Questions** - Get help with usage or clarify documentation
- **Browser compatibility** - Report issues on specific browsers or devices
- **Accessibility problems** - Help us comply with Web Content Accessibility Guidelines (WCAG)

When reporting bugs, please include:

- Browser and version information
- Steps to reproduce the issue
- Expected vs actual behavior
- Code example demonstrating the problem
- Screenshots or recordings if helpful

## Pull requests

Pull requests are welcome! **For significant changes, please first create an issue** to discuss the use case and implementation approach. This helps ensure your contribution aligns with project goals.

### Process

1. Fork this repository
1. Create a new feature branch based off the `main` branch.
1. Make your changes following our code guidelines
1. Test across browsers (Chrome, Safari, Firefox)
1. Submit a pull request with:
   - Clear description of changes
   - Link to related issue (if applicable)
   - Screenshots for UI changes (if applicable)
   - Updated tests and documentation

## Development

### Prerequisites

- Node.js (latest LTS)
- npm

### Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`

### Building

- Development: `npm run build`
- Production: `npm run build:prod`

### Running examples

- Astro: `npm run dev -w examples/astro`
- React/Next.js: `npm run dev -w examples/react-nextjs`
- Vue/Nuxt: `npm run dev -w examples/vue-nuxt`

### Running tests

End-to-end tests use [WebdriverIO](https://webdriver.io/) and run against the Astro
example dev server.

```bash
# Run tests with default browsers (Chrome, Firefox, MiniBrowser)
npm run test:wdio

# Run tests with specific browsers
BROWSERS=chrome npm run test:wdio
BROWSERS=chrome,firefox npm run test:wdio

# Run tests in headless mode
HEADLESS=true npm run test:wdio
```

Available browsers: `chrome`, `firefox`, `minibrowser`, `safari`

The tests will use an already running dev server on port 4321 if available, otherwise they start one automatically.

| Environment variable | Description                                                                                 | Default                                                     |
| -------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `BASE_URL`           | Point tests at a different server (e.g. `https://viliket.github.io/pure-web-bottom-sheet/`) | `http://localhost:<DEV_SERVER_PORT>/pure-web-bottom-sheet/` |
| `DEV_SERVER_PORT`    | Port for the local dev server                                                               | `4321`                                                      |
| `WEBKIT_DRIVER_PORT` | Port for the WebKit WebDriver                                                               | `4444`                                                      |

## Code guidelines

- Follow existing code patterns and conventions
- Use TypeScript for type safety
- Ensure accessibility
- Test on both mobile and desktop devices
- Leverage CSS over JavaScript where possible
- Maintain cross-browser compatibility
- Write clear, self-documenting code

---

Have questions? Feel free to open an issue for discussion!

Thank you for contributing! ❤️
