# Documentação do Banco de Dados

Aviso: não foi encontrada a pasta `db/` no repositório. Se você possui os arquivos de schema (SQL, migrations, Prisma schema ou um arquivo .sqlite), coloque-os na pasta `db/` na raiz do projeto e eu atualizo esse documento automaticamente.

O que incluir em `db/`
- `schema.sql` — dump com criação de tabelas
- `migrations/` — histórico de migrações
- `README-db.md` — instruções de restauração

Esquema (modelo provável)
--------------------------
Baseado nos serviços e respostas do backend, as entidades principais são:

- `empresas` — informações da empresa
- `clientes` — cliente (id_cliente, nome, telefone, email, endereco)
- `veiculos` — ligado a cliente (id_veiculo, placa, modelo, ano)
- `baterias` — catálogo (id_bateria, codigo, modelo, amperagem, garantia_meses, preco_venda, preco_custo)
- `atendimentos` — atendimento (id_atendimento, id_cliente, id_veiculo, data_atendimento, status, observacoes)
- `itens_atendimento` — itens vendidos/trocados no atendimento (id_item, id_atendimento, id_bateria, quantidade, valor_unitario)
- `estoque_movimentacoes` — histórico de movimentações (id, tipo, quantidade, id_bateria, origem, destino, created_at)

Relacionamentos (ER)
- `clientes` 1:N `veiculos`
- `atendimentos` N:1 `clientes`
- `atendimentos` N:1 `veiculos`
- `itens_atendimento` N:1 `atendimentos`
- `itens_atendimento` N:1 `baterias`

Como gerar documentação automática
---------------------------------
Se você fornecer `schema.sql` ou `prisma/schema.prisma`, eu gero um diagrama ER e este arquivo será preenchido automaticamente.
