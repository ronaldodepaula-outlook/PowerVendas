# Fluxo Operacional — Guia para Equipe

Este documento descreve procedimentos operacionais para time comercial, suporte e técnicos.

1) Atendimento ao cliente (fluxo padrão)
- Recepção do cliente/telefone → Registrar atendimento no sistema (novo atendimento)
- Registrar veículo (ou selecionar existente)
- Inserir itens vendidos/trocados (incluir `id_bateria` quando aplicável)
- Finalizar atendimento e gerar nota/registro

2) Gerenciamento de garantias
- Ao registrar venda, sistema grava data de compra e vincula `garantia_meses` do cadastro da bateria.
- Para consultar garantias: abrir `Clientes > Ver` → seção Garantias.
- Para garantir conformidade, equipe técnica deve registrar corretamente `id_bateria` nos itens.

3) Suporte e reembolso
- Verificar histórico de atendimentos do cliente antes de qualquer procedimento.
- Registrar observações no atendimento e anexar fotos se necessário.

4) Rotina diária (checklist)
- Conferir atendimentos do dia e status de garantias próximas a vencer.
- Exportar CSV de garantias quando necessário para envio de e-mail marketing ou avisos.

5) Contatos e escalonamento
- 1º nível: equipe de loja — utiliza tela de atendimentos e clientes
- 2º nível: técnico senior — valida cálculos de garantia e substituição
- 3º nível: admin/infra — problemas de deploy e integração com APIs
