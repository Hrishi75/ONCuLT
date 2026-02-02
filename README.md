# OnCuLT
OnCuLT is a social e-commerce and programmable payout platform for live experiences, built entirely on the Ethereum ecosystem.

Live events—such as conferences, meetups, concerts, and community gatherings—generate culture, identity, and commerce, but once the event ends, merchandise, collectibles, and revenue flows become fragmented or disappear entirely. Fans lose visibility into what was created, creators lose long-term monetization opportunities, and payouts across collaborators remain manual and opaque.

Our platform solves this by combining social profiles, a marketplace, and an on-chain payout layer, all powered by Ethereum smart contracts and wallets. Users can create Ethereum-native profiles, showcase collectibles and merchandise received at events, post updates to a social feed, and list items for sale directly from their profiles or posts. Other users can explore event-based collections, discover what attendees received, and purchase items through secure, on-chain transactions.

Event hosts and organizers can launch official merchandise, run limited or exclusive drops, and continue engaging their audience long after the event ends. Artists, creators, or designers can contribute their own merchandise to events and automatically receive revenue shares and royalties. Fans—whether they attended in person or remotely—can participate in event culture through ownership, trading, and discovery.

All payments are handled through Ethereum-based stablecoins and a programmable payout system that supports automatic revenue splits, royalties, and backend rules for collaborators, sponsors, or managers. This allows instant, transparent, and trust-minimized global settlements without requiring recipients to have deep crypto knowledge.

While the platform launches with Ethereum events as its initial focus, the same Ethereum-native infrastructure naturally extends to the broader entertainment industry—including music, sports, and creator-led experiences—using the same primitives for identity, ownership, commerce, and payouts.

By leveraging Ethereum’s programmable money and digital ownership, the platform transforms live experiences into persistent, tradable, and monetizable ecosystems that strengthen community culture, creator economies, and global participation.











# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
