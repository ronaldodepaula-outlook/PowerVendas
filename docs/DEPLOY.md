# Guia de Deploy (Vercel / Netlify / Render / Railway / Expo)

Este documento descreve opções e passos para publicar a aplicação em provedores populares.

Frontend (Web)
--------------
Opções: Vercel, Netlify

Vercel
- Conecte o repositório GitHub/GitLab/Bitbucket ao Vercel
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: adicionar variáveis de runtime (API_URL, NODE_ENV, etc.)

Netlify
- Conecte o repositório
- Build command: `npm run build`
- Publish directory: `dist`
- Configure `NETLIFY_BUILD_IMAGE` e variáveis de ambiente necessárias

Backend / API
---------------
Opções: Render, Railway

Render
- Crie um novo serviço Web (Docker ou Node)
- Sete `PORT` e `NODE_ENV`
- Configure secrets (DB connection, JWT secret)

Railway
- Crie um novo projeto e adicione um serviço (Node)
- Configure variáveis de ambiente e a conexão com o banco

Mobile (Expo)
---------------
Expo Publish
- Configure `expo` no projeto mobile (se aplicável)
- `expo publish` gera link público do bundle

Dicas gerais
-----------
- Mantenha variáveis sensíveis em secrets do provedor
- Monitore logs e health checks
- Configure rotas de fallback para SPA (`index.html`) quando necessário
