# Configuração da Evolution API no Dekploy

## O que é a Evolution API?

A Evolution API é uma solução **100% gratuita e open-source** para integração com WhatsApp. Ela permite:
- Enviar e receber mensagens do WhatsApp
- Gerenciar múltiplas instâncias/sessões
- Webhooks para eventos em tempo real
- Persistência de dados em banco de dados
- QR Code para autenticação

## Arquitetura

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend API    │────▶│   Evolution API │
│   (Next.js)     │     │   (Fastify)      │     │   (WhatsApp)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │                          │
                               ▼                          ▼
                        ┌──────────────┐          ┌──────────────┐
                        │   Redis      │          │  PostgreSQL  │
                        └──────────────┘          └──────────────┘
```

## Configuração incluída

### 1. Docker Compose

A Evolution API foi adicionada ao [docker-compose.yml](../docker-compose.yml):

```yaml
evolution-api:
  image: atendai/evolution-api:latest
  ports:
    - "8080:8080"
  environment:
    - SERVER_URL=${EVOLUTION_SERVER_URL}
    - AUTHENTICATION_API_KEY=${EVOLUTION_API_KEY}
    - DATABASE_ENABLED=true
    - DATABASE_PROVIDER=postgresql
    - DATABASE_CONNECTION_URI=${EVOLUTION_DATABASE_URL}
  volumes:
    - evolution_instances:/evolution/instances
    - evolution_store:/evolution/store
  restart: unless-stopped
```

### 2. Variáveis de Ambiente

Adicione estas variáveis no Dekploy (já incluídas em [.env.dokploy](../.env.dokploy)):

```bash
# Evolution API
EVOLUTION_SERVER_URL="http://69.62.101.194:8080"
EVOLUTION_API_KEY="suaSenhaSeguraAqui123456789012"
EVOLUTION_DATABASE_URL="postgresql://postgres:senha@postgres:5432/evolution"
EVOLUTION_WEBHOOK_URL="http://backend:4000/api/webhooks/whatsapp/evolution"

# WhatsApp (usando Evolution API)
WHATSAPP_BASE_URL="http://evolution-api:8080"
WHATSAPP_TOKEN="suaSenhaSeguraAqui123456789012"
WHATSAPP_PHONE_NUMBER_ID="ondeclick-whatsapp"
```

**IMPORTANTE - Como funciona a autenticação**:
- ⚠️ **VOCÊ define a senha**: `EVOLUTION_API_KEY` é uma senha que **você cria** para proteger sua API
- ⚠️ **NÃO é gerada pela Evolution API**: Não precisa se registrar em lugar nenhum
- ⚠️ **É apenas uma senha de acesso**: Pense nela como a senha do seu Wi-Fi
- `EVOLUTION_API_KEY` e `WHATSAPP_TOKEN` **devem ser iguais** (mesma senha)
- Gere uma senha segura: `openssl rand -hex 32` ou use qualquer string forte
- Exemplo: `minhaChaveSecreta2024OndeClick` ou `abc123def456ghi789jkl012mno345`

## Deploy no Dekploy

### Passo 1: Criar o banco de dados para Evolution API

No PostgreSQL do Dekploy, crie o banco:

```sql
CREATE DATABASE evolution;
```

### Passo 2: Configurar variáveis de ambiente

No painel do Dekploy, adicione todas as variáveis listadas acima.

### Passo 3: Deploy com Docker Compose

O Dekploy irá ler o [docker-compose.yml](../docker-compose.yml) e fazer deploy de todos os serviços, incluindo a Evolution API.

### Passo 4: Verificar se está rodando

Acesse: `http://69.62.101.194:8080/manager`

Você verá a interface de gerenciamento da Evolution API.

## Criando uma Instância do WhatsApp

### Via API (Recomendado)

```bash
# 1. Criar instância
curl -X POST http://69.62.101.194:8080/instance/create \
  -H "apikey: sua-chave-secreta-aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "ondeclick-whatsapp",
    "qrcode": true,
    "integration": "WHATSAPP-BAILEYS"
  }'

# 2. Obter QR Code para conectar
curl http://69.62.101.194:8080/instance/connect/ondeclick-whatsapp \
  -H "apikey: sua-chave-secreta-aqui"

# Resposta:
# {
#   "qrcode": {
#     "base64": "data:image/png;base64,iVBORw0KG...",
#     "code": "1@ABC..."
#   }
# }

# 3. Escanear o QR Code no WhatsApp
# WhatsApp > Menu (3 pontos) > Aparelhos conectados > Conectar um aparelho

# 4. Verificar status
curl http://69.62.101.194:8080/instance/connectionState/ondeclick-whatsapp \
  -H "apikey: sua-chave-secreta-aqui"

# Resposta quando conectado:
# {
#   "instance": {
#     "instanceName": "ondeclick-whatsapp",
#     "state": "open"
#   }
# }
```

### Via Interface Web

1. Acesse: `http://69.62.101.194:8080/manager`
2. Faça login com a API Key
3. Clique em "Create Instance"
4. Preencha:
   - Instance Name: `ondeclick-whatsapp`
   - Integration: `WHATSAPP-BAILEYS`
5. Clique em "Create"
6. Clique em "Connect" e escaneie o QR Code

## Testando o Envio de Mensagens

### Teste básico

```bash
curl -X POST http://69.62.101.194:8080/message/sendText/ondeclick-whatsapp \
  -H "apikey: sua-chave-secreta-aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "text": "Olá! Esta é uma mensagem de teste da Evolution API."
  }'
```

### Com mídia (imagem)

```bash
curl -X POST http://69.62.101.194:8080/message/sendMedia/ondeclick-whatsapp \
  -H "apikey: sua-chave-secreta-aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "mediatype": "image",
    "media": "https://example.com/image.jpg",
    "caption": "Confira nossa promoção!"
  }'
```

### Com botões

```bash
curl -X POST http://69.62.101.194:8080/message/sendButtons/ondeclick-whatsapp \
  -H "apikey: sua-chave-secreta-aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "title": "Menu de Opções",
    "description": "Escolha uma opção:",
    "buttons": [
      {"buttonId": "1", "buttonText": {"displayText": "Ver Promoções"}},
      {"buttonId": "2", "buttonText": {"displayText": "Falar com Atendente"}}
    ]
  }'
```

## Webhooks

A Evolution API enviará webhooks para o backend quando:
- Receber uma mensagem
- Status da mensagem mudar (enviada, entregue, lida)
- Conexão cair/reconectar

Configure o webhook global no [docker-compose.yml](../docker-compose.yml):

```yaml
- WEBHOOK_GLOBAL_URL=${EVOLUTION_WEBHOOK_URL}
- WEBHOOK_GLOBAL_ENABLED=true
```

O backend receberá os eventos em:
`http://backend:4000/api/webhooks/whatsapp/evolution`

## Integração com n8n

No n8n, atualize o workflow "Campaign Send" para usar a Evolution API:

### Nó HTTP Request

- **URL**: `http://evolution-api:8080/message/sendText/{{ $env.WHATSAPP_PHONE_NUMBER_ID }}`
- **Method**: POST
- **Authentication**: Generic Credential Type
  - Header Auth
  - Name: `apikey`
  - Value: `{{ $env.EVOLUTION_API_KEY }}`
- **Body**:
  ```json
  {
    "number": "{{ $json.phone }}",
    "text": "{{ $json.message.text }}"
  }
  ```

## Monitoramento

### Verificar status da instância

```bash
curl http://69.62.101.194:8080/instance/fetchInstances \
  -H "apikey: sua-chave-secreta-aqui"
```

### Ver logs do container

```bash
docker logs evolution-api -f --tail 100
```

### Verificar saúde da API

```bash
curl http://69.62.101.194:8080/health
```

## Persistência de Dados

A Evolution API usa volumes Docker para persistir:
- **evolution_instances**: Sessões do WhatsApp
- **evolution_store**: Arquivos de mídia
- **PostgreSQL**: Mensagens, contatos, chats

**IMPORTANTE**: Faça backup regular desses volumes!

## Troubleshooting

### Instância desconectada

Se a instância desconectar, reconecte:

```bash
curl http://69.62.101.194:8080/instance/connect/ondeclick-whatsapp \
  -H "apikey: sua-chave-secreta-aqui"
```

### QR Code expirado

O QR Code expira em 30 segundos. Gere um novo:

```bash
curl http://69.62.101.194:8080/instance/connect/ondeclick-whatsapp \
  -H "apikey: sua-chave-secreta-aqui"
```

### Mensagens não enviando

1. Verifique o status da instância
2. Verifique se o número está no formato correto: `5511999999999` (sem +, espaços ou hífens)
3. Verifique os logs: `docker logs evolution-api`

### Banco de dados corrompido

Se o banco ficar corrompido, pode-se recriar:

```bash
# Deletar instância
curl -X DELETE http://69.62.101.194:8080/instance/delete/ondeclick-whatsapp \
  -H "apikey: sua-chave-secreta-aqui"

# Recriar
curl -X POST http://69.62.101.194:8080/instance/create \
  -H "apikey: sua-chave-secreta-aqui" \
  -d '{"instanceName": "ondeclick-whatsapp", "qrcode": true}'
```

## Segurança

1. **API Key forte**: Use no mínimo 32 caracteres aleatórios
2. **Firewall**: Limite acesso à porta 8080 apenas ao backend e IPs confiáveis
3. **HTTPS**: Em produção, use um proxy reverso com SSL (Nginx/Traefik)
4. **Backup**: Configure backup automático dos volumes

## Recursos Adicionais

- **Documentação oficial**: https://doc.evolution-api.com/
- **GitHub**: https://github.com/EvolutionAPI/evolution-api
- **Swagger/API Docs**: http://69.62.101.194:8080/docs
- **Manager UI**: http://69.62.101.194:8080/manager

## Custos

**ZERO!** A Evolution API é 100% gratuita e open-source.

- Sem limites de mensagens
- Sem taxas por conversação
- Sem custos de API
- Hospedagem no seu próprio servidor

## Comparação com WhatsApp Business API oficial

| Recurso | Evolution API | WhatsApp Cloud API |
|---------|---------------|-------------------|
| Custo | Gratuito | Pago (por conversa) |
| Limites | Sem limites* | Limitado pelo plano |
| Configuração | Simples (QR Code) | Complexo (verificação Meta) |
| Aprovação | Não requer | Requer aprovação Meta |
| Tempo setup | 5 minutos | Dias/semanas |

*Sujeito aos limites do WhatsApp para contas novas

## Próximos Passos

1. ✅ Deploy da Evolution API no Dekploy
2. ✅ Criar instância do WhatsApp
3. ✅ Testar envio de mensagens
4. ✅ Atualizar n8n para usar Evolution API
5. ⬜ Configurar webhooks para receber mensagens
6. ⬜ Implementar fluxo completo de campanhas
7. ⬜ Monitorar e otimizar performance
