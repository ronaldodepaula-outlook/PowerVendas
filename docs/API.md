# Documentação da API — Baterias Gestão

Este documento descreve os endpoints usados pelo frontend, exemplos de requisições e fluxo de uso para validação de features críticas (recuperação de senha, atendimentos, movimentações).

Base URL
--------
Exemplo: `https://rdpsolutions.online/api-saas/public/api`

Autenticação
------------
- O sistema usa token Bearer (guardar em `localStorage` como `empresa_token` no frontend). Configure `Authorization: Bearer <token>` em todas as chamadas protegidas.

Endpoints importantes
--------------------

1) Recuperar senha — solicitar
- POST `/auth/recuperar-senha/solicitar`
- Body: `{ "email": "user@exemplo.com", "tipo_usuario": "EMPRESA" }`
- Retorno: `{ message: "Se o e-mail estiver cadastrado, você receberá um link..." }`

2) Recuperar senha — validar token
- POST `/auth/recuperar-senha/validar-token`
- Body: `{ "token": "xxx", "tipo_usuario": "EMPRESA" }`
- Retorno: `{ valid: true, email: "user@exemplo.com", tipo_usuario: "EMPRESA" }`

3) Recuperar senha — resetar
- POST `/auth/recuperar-senha/resetar`
- Body: `{ "token": "xxx", "tipo_usuario": "EMPRESA", "nova_senha": "...", "nova_senha_confirmation": "..." }`
- Retorno: `{ message: "Senha alterada com sucesso." }`

4) Movimentações (exemplo)
- POST `/estoque/movimentar` — enviar payload de movimentação. Consulte `src/services/estoque.service.ts` para shape esperado.

5) Clientes dashboard
- GET `/clientes/{id}/dashboard` — retorna `summary`, `veiculos`, `atendimentos`, `warranty_items`, `per_vehicle`, `notifications`.

Fluxos de usuário críticos (exemplos)
----------------------------------

- Fluxo: Recuperação de senha
  1. Usuário solicita reset com e-mail.
  2. Servidor envia e-mail com link `confirma/recuperar-senha?token=...&tipo=EMPRESA`.
  3. Frontend valida token via `/validar-token` e mostra formulário de nova senha.
  4. Usuário envia nova senha para `/resetar`.

- Fluxo: Registrar atendimento com garantia
  1. Criar atendimento via endpoint (veículo, cliente, itens incluindo `id_bateria`).
  2. Backend calcula `garantia_meses` a partir do cadastro da bateria e pode retornar `garantia_restante_meses`.
  3. Frontend exibe garantia no dashboard do cliente.

Como usar tecnicamente
----------------------
- Requisições: enviar `Content-Type: application/json` e `Authorization` quando necessário.
- Capturar erros: backend tipicamente retorna `{ message: '...' }` em `response.data`.

Postman collection
------------------
Existe uma collection no projeto `src/SaaS Plataforma Completa — EMPRESA.postman_collection.json` que você pode importar no Postman para testar todos os endpoints.
