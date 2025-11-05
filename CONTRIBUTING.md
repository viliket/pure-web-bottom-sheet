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

### Running Examples

- Astro: `npm run dev -w examples/astro`
- React/Next.js: `npm run dev -w examples/react-nextjs`
- Vue/Nuxt: `npm run dev -w examples/vue-nuxt`

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
