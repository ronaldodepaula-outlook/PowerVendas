# Guia de Uso — Recursos e Fluxos

1) Login e Registro
- Acesse `/login` para autenticação.
- Use `/register` para criar nova conta.

2) Clientes e CRM
- `Clientes` → lista → clique em `Ver` para abrir dashboard do cliente.
- Dashboard exibe resumo, atendimentos, garantias e veículos.

3) Atendimentos
- Crie novo atendimento via UI `Atendimentos` → novo.
- Adicione itens com `id_bateria` para garantir cálculo de garantia.

4) Estoque e Movimentações
- Use módulo `Movimentações` para entrada/saída de estoque.
- Ao movimentar, prefira enviar `produtoId` (id_bateria) no payload.

5) Exportar dados
- Vários módulos oferecem export CSV (ex.: garantias no dashboard do cliente).

6) Logs e Debug
- Verifique console do navegador para mensagens do frontend.
- Requisições falhas costumam retornar `{ message: '...' }` no body.
