/**
 * Configura webhook no Evolution API para enviar mensagens ao bot.
 * Uso: npm run evo:webhook
 *
 * Requer EVOLUTION_API_URL, EVOLUTION_API_KEY e EVOLUTION_INSTANCE no .env
 * O Evolution API precisa estar rodando (docker compose up -d)
 */

const API_URL = process.env.EVOLUTION_API_URL ?? 'http://localhost:8080'
const API_KEY = process.env.EVOLUTION_API_KEY ?? ''
const INSTANCE = process.env.EVOLUTION_INSTANCE ?? 'guigo'
const WEBHOOK_URL = process.env.WEBHOOK_URL ?? 'http://host.docker.internal:3001/webhook'

if (!API_KEY) {
  console.error('Defina EVOLUTION_API_KEY no .env')
  process.exit(1)
}

async function configurarWebhook(): Promise<void> {
  console.log(`Configurando webhook da instancia "${INSTANCE}"...`)
  console.log(`URL do webhook: ${WEBHOOK_URL}\n`)

  const res = await fetch(`${API_URL}/webhook/set/${INSTANCE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: API_KEY,
    },
    body: JSON.stringify({
      webhook: {
        enabled: true,
        url: WEBHOOK_URL,
        webhook_by_events: false,
        webhook_base64: false,
        events: ['MESSAGES_UPSERT'],
      },
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error(`Erro ${res.status}: ${body}`)
    process.exit(1)
  }

  const data = (await res.json()) as Record<string, unknown>
  console.log('Webhook configurado com sucesso!')
  console.log(JSON.stringify(data, null, 2))
}

configurarWebhook()
