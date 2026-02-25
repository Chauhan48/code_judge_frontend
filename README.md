# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## Application-specific notes

### New API endpoints

- `GET /api/admin/submissions` accepts query parameters `testId`, `problemId` and `email`.
- `POST /api/test/run` expects a JSON body with `sourceCode`, `stdin`, `languageKey`, `problemId` and `token`.
- `GET /api/test/progress?token=<token>` returns a candidate's progress (public look‑up by token).

### UI changes

- Dashboard now includes a **View Progress** quick action card. Clicking it navigates to `/progress`.
- The new **Progress** page fetches a list of candidates via `GET /api/admin/candidates` when loaded. The emails are displayed as clickable links, and selecting one loads the corresponding progress by passing the candidate's token to `GET /api/test/progress`.
- A manual token input field remains available for direct lookups.
- `TestPage` no longer uses a hard‑coded email when fetching submission history; the email is read from the test metadata.

