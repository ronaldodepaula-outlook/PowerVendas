# PowerVendas Gestão — Aplicação SaaS

Descrição
----------------
Aplicação web para gestão de vendas e estoque de baterias, com módulos de clientes, veículos, atendimentos, estoque, movimentações e financeiro. Permite gerenciamento multi-empresa, registro de atendimentos, controle de garantias e relatórios básicos.

Tecnologias utilizadas
----------------------
- Frontend: React + TypeScript + Vite
- Estilos: Tailwind CSS
- Icons: lucide-react
- HTTP client: axios (em `src/services/api.ts`)
- Bundler: Vite
- Testes: (nenhum configurado por padrão)

Arquitetura
----------
- Monorepo front-end: código React em `src/`
- Serviços organizados em `src/services/` (API wrappers)
- Rotas definidas em `src/routes.tsx`
- Padrão: componente por página, hooks de autenticação em `src/hooks`

Como instalar
--------------
Pré-requisitos: Node.js 18+ e npm

1. Clone o repositório
```bash
git clone <repo-url>
cd baterias-gestao
```
2. Instale dependências
```powershell
npm install
```

Como rodar (desenvolvimento)
-----------------------------
```powershell
npm run dev
```
Abra no navegador `http://localhost:5173` (porta padrão do Vite).

Build para produção
--------------------
```powershell
npm run build
npm run preview
```

Melhorias futuras
------------------
- Internacionalização (i18n)
- Testes E2E e unitários (Jest + Testing Library + Playwright)
- Melhorar analytics/telemetria
- Otimizações de performance e SSR para páginas públicas

Diferenciais do projeto
------------------------
- UI leve com Tailwind CSS e componentes reutilizáveis
- Fluxo de garantias integrado com cálculo automático
- Estrutura modular para serviços e páginas

Documentação adicional
----------------------
Veja a pasta `docs/` para guias de deploy, API, fluxo operacional e esquema de banco.
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
