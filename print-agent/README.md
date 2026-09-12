# Moca Print Agent

Programa local responsável por buscar pedidos confirmados no site e imprimir na Elgin i9 Full. Ele não emite NFC-e e não altera o banco do Raffinato.

## Preparação

1. Instale Node.js 20 ou superior no computador que fica ligado no restaurante.
2. Descubra o IP fixo da Elgin i9 Full pela página de teste/configuração da impressora.
3. Copie `.env.example` para `.env` e preencha `API_URL`, `PRINT_AGENT_TOKEN` e `PRINTER_HOST`.
4. Comece com `PRINTER_MODE=file`. Execute `npm run test:print` e confira o arquivo criado em `out/`.
5. Mude para `PRINTER_MODE=network` e execute novamente o teste. A impressora deverá produzir um pedido marcado como teste.

## Instalação automática no Windows

Abra o PowerShell como Administrador nesta pasta e execute:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\install-windows.ps1 -TestPrint
```

O agente será iniciado com o Windows. O histórico local impede que o mesmo pedido seja impresso duas vezes caso a confirmação pela internet falhe.

## Segurança

- Não abra a porta da impressora no roteador.
- Não publique o arquivo `.env`.
- O computador do restaurante inicia apenas conexões HTTPS de saída para o site.
- A NFC-e continuará sendo emitida exclusivamente pelo Raffinato até a homologação oficial.
