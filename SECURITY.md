# Segurança

Não envie vulnerabilidades, tokens, URLs de banco ou dados reais de clientes por issues públicas.

Para uma implantação própria:

- use tokens diferentes para o painel e o agente de impressão;
- mantenha a porta 9100 acessível somente na rede local;
- proteja as variáveis no provedor de hospedagem;
- aplique retenção adequada aos dados de pedidos;
- mantenha `RAFFINATO_MODE=disabled` sem homologação oficial.

Em caso de falha de segurança, suspenda os tokens afetados e gere novos segredos antes de reiniciar o serviço.
