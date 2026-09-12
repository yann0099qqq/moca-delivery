# Moca Delivery

Cardápio digital full stack para restaurante japonês, com carrinho, checkout, cálculo de entrega por distância, painel operacional e impressão automática.

**Desenvolvido por Ian Antonio.**

> Projeto de portfólio preparado para demonstração técnica. As fotografias dos produtos usam um espaço reservado e podem ser adicionadas sem alterar a estrutura do catálogo.

## Contexto do projeto

O Moca Delivery foi desenvolvido durante um trabalho **freelance de 1 mês**, com foco em transformar o atendimento de um restaurante japonês em um fluxo digital completo: cardápio, carrinho, checkout, registro e gestão dos pedidos e preparação da impressão das comandas.

Nesse período, atuei no levantamento do fluxo do negócio, prototipação da experiência, desenvolvimento full stack, modelagem do banco de dados, segurança das APIs, testes e documentação para implantação. O resultado é uma solução pronta para portfólio e demonstração técnica, com as integrações que dependem de fornecedores externos mantidas isoladas até a homologação.

![Identidade do Moca Delivery](public/og.png)

## Destaques

- Catálogo responsivo com busca, categorias, variações, combos, bebidas, vinhos e drinks.
- Carrinho persistente com quantidades e observações por item.
- Localização automática do cliente e entrega calculada a **R$ 1,00 por quilômetro**, validada novamente no servidor.
- Checkout para entrega ou retirada com Pix, crédito, débito ou dinheiro.
- Preços recalculados no servidor para impedir manipulação pelo navegador.
- Idempotência, limite de pedidos e validação de CPF/CNPJ.
- Registro de pedidos em PostgreSQL/Neon.
- Painel protegido em `/admin`, atualização de status e reimpressão.
- Fila segura de impressão com token, lock, tentativas e histórico de eventos.
- Agente local para Windows e cupom ESC/POS não fiscal na Elgin i9 Full.
- Confirmação do pedido por WhatsApp e aviso de privacidade.
- Health check, TypeScript, ESLint e testes automatizados.

## Arquitetura

```mermaid
flowchart LR
  A[Cliente] --> B[Next.js]
  B --> C[(PostgreSQL)]
  D[Painel] --> B
  E[Agente local] -->|HTTPS + token| B
  E -->|TCP 9100| F[Elgin i9 Full]
```

A impressora nunca é exposta à internet. O agente instalado no computador do restaurante consulta a fila por HTTPS e envia a comanda pela rede local.

## Tecnologias

- Next.js 16, React 19 e TypeScript
- PostgreSQL/Neon
- API Routes e validação no servidor
- Node.js no agente de impressão
- ESC/POS via TCP
- GitHub Actions para build, lint e testes

## Variáveis de ambiente

| Variável | Uso |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL pública do cardápio |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp com DDI e DDD, somente números |
| `ROUTING_API_URL` | Serviço de rotas; por padrão usa a instância pública do OSRM |
| `DATABASE_URL` | Conexão PostgreSQL/Neon |
| `PRINT_AGENT_TOKEN` | Segredo de no mínimo 32 caracteres para a fila de impressão |
| `ADMIN_TOKEN` | Segredo de no mínimo 32 caracteres para o painel operacional |
| `RAFFINATO_MODE` | Deve permanecer `disabled` sem homologação do fornecedor |

Desenvolvido por **Ian Antonio** · 2026
