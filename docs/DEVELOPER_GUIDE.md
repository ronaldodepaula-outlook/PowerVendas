# Guia do Desenvolvedor — Baterias Gestão

Este documento fornece detalhes técnicos para desenvolvedores: arquitetura, módulos importantes, padrões de código, operações, dependências, configuração de ambiente e práticas de segurança.

1. Visão geral da arquitetura
-----------------------------
- Frontend: React + TypeScript (Vite)
  - Padrão: páginas em `src/pages`, componentes em `src/components`, serviços de API em `src/services`.
  - Autenticação: `src/hooks/useAuth` + `src/services/api.ts` (axios com token em localStorage `empresa_token`).
- Backend: API REST (externa) — endpoints utilizados estão documentados em `docs/API.md` e na Postman collection `src/SaaS Plataforma Completa — EMPRESA.postman_collection.json`.
- Deploy: Frontend serve SPA (Vite build output). Backend hospedado separadamente (Render / Railway / Heroku etc.). Veja `docs/DEPLOY.md`.

2. Organização do repositório
----------------------------
- `src/` — código fonte React
  - `src/pages/` — pages/rotas da aplicação
  - `src/components/` — componentes reutilizáveis (ex.: `auth`, `layout`)
  - `src/services/` — wrappers de API (axios)
  - `src/hooks/` — hooks customizados (ex.: `useAuth`)
  - `src/routes.tsx` — definição de rotas
- `docs/` — documentação (API, deploy, operação, DB)

3. Módulos importantes (frontend)
---------------------------------
- Autenticação (`src/components/auth`, `src/hooks/useAuth`)
  - Login, registro, recuperação de senha (fluxo com token)
  - Armazena token em `localStorage` e injeta no header `Authorization` via `src/services/api.ts`.
- Clientes (`src/pages/clientes/`) — listagem, detalhes, dashboard do cliente (garantias, atendimentos).
- Estoque (`src/pages/EstoqueList.tsx`, `src/services/estoque.service.ts`) — listagem de baterias, movimentações.
- Atendimentos (`src/pages/AtendimentosList.tsx`) — registrar venda/serviço, itens com `id_bateria`.
- Financeiro (`src/pages/FinanceiroPage.tsx`) — telas e integrações para lançamentos e fechamento.
- Movimentações (`src/pages/MovimentacoesPage.tsx`) — entrada/saída de estoque.

4. Padrões de código e recomendações
------------------------------------
- TypeScript estrito: evite `any`. Use `unknown` e refine antes de acessar propriedades.
- Serviços API: encapsule chamadas axios em `src/services/*.ts` com tipagens de payload/response.
- Erros e logging: normalize a extração de `err.response?.data?.message` (considere util `src/utils/error.ts`).
- Estilo: siga convenções já utilizadas (Tailwind classes; sem CSS inline complexo).

5. Configuração de ambiente
----------------------------
- Arquivos principais:
  - `package.json` — scripts (dev, build, preview)
  - `.env` — variáveis locais (não versionar):
    - `VITE_API_URL` — URL da API
    - `VITE_APP_ENV` — modo (staging, production)

6. Build e CI/CD
-----------------
- Scripts importantes:
  - `npm run dev` — rodar em dev
  - `npm run build` — gerar build para produção
  - `npm run preview` — pré-visualizar build
- Integração contínua recomendada: GitHub Actions com jobs de lint, typecheck e build.

7. Segurança (recomendações)
---------------------------
- Transmissão: exigir HTTPS (TLS) em produção para todas as chamadas.
- Armazenamento de tokens: token de sessão no localStorage (convenção atual). Para maior segurança, prefira cookies HttpOnly+Secure com SameSite quando backend suportar.
- Proteção CSRF: se usar cookies, implemente proteção CSRF.
- Validação de entrada: validar e sanitizar todos os dados no backend; frontend valida antes de enviar (UX), não confie apenas no frontend.
- Rate limiting: aplicar limite no backend para endpoints sensíveis (login, recuperar-senha).
- Secrets: manter segredo em providers (Vercel/Netlify/Render/Railway). Não commitar `.env`.
- Logging & Auditoria: registrar operações críticas (login, reset de senha, movimentações financeiras) com auditoria (userId, timestamp, ip).

8. Requisitos operacionais (devops)
----------------------------------
- Backups: estratégia diária para DB (full) e retenção mínima 30 dias.
- Monitoramento: Sentry para erros, Prometheus + Grafana para métricas, alertas em Slack/Email.
- Deploy: ambiente `staging` antes de `production`, com migrations executadas por CI/CD.
- Rollback: manter snapshots ou migrações reversíveis.

9. Fluxo de desenvolvimento local
---------------------------------
1. Clonar repo e instalar dependências
2. Configurar `.env` com `VITE_API_URL` apontando para ambiente dev
3. `npm run dev`
4. Executar testes e linters antes de abrir PR

10. Integração com backend
--------------------------
- API base em `VITE_API_URL`. Use `src/services/api.ts` para configurar axios instance com baseURL e interceptors (autorização).
- Documente contratos de payload/response em `docs/API.md` e mantenha Postman collection atualizada.

11. Checklist antes de produção
-------------------------------
- Testes unitários e E2E completos
- Revisão de segurança (dependabot, Snyk)
- Backups e monitoramento configurados
- Variáveis de ambiente e secrets preenchidos no provedor

12. Pontos de extensão
----------------------
- Internacionalização
- Integração com gateways de pagamento (se financeiro precisar de conciliação automática)
- API pública (OpenAPI/Swagger) para parceiros

---
> Observação: este guia assume que o backend é um serviço separado. Se quiser, posso gerar um arquivo `src/utils/error.ts` para centralizar a extração segura de mensagens de erro e substituir ocorrências existentes.
