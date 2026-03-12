import http from 'node:http'

const MOTORISTA = process.env.MOTORISTA_WHATSAPP ?? ''
const PORT = Number(process.env.PORT ?? 3001)

interface EvolutionPayload {
  event: string
  instance: string
  data: {
    key: {
      remoteJid: string
      fromMe: boolean
      id: string
    }
    pushName?: string
    message?: {
      conversation?: string
      extendedTextMessage?: {
        text: string
      }
    }
    messageType?: string
    messageTimestamp?: number
  }
}

type MessageHandler = (texto: string) => Promise<void>

let onMensagem: MessageHandler = async () => {}

export function setMessageHandler(handler: MessageHandler): void {
  onMensagem = handler
}

function extrairTexto(payload: EvolutionPayload): string | null {
  const msg = payload.data?.message
  if (!msg) return null
  return msg.conversation ?? msg.extendedTextMessage?.text ?? null
}

function extrairNumero(payload: EvolutionPayload): string {
  const jid = payload.data?.key?.remoteJid ?? ''
  return jid.replace('@s.whatsapp.net', '')
}

function eMensagemDoPai(payload: EvolutionPayload): boolean {
  if (payload.data?.key?.fromMe) return false
  return extrairNumero(payload) === MOTORISTA
}

function lerBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString()
    })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

const server = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    try {
      const body = await lerBody(req)
      const payload = JSON.parse(body) as EvolutionPayload

      if (payload.event !== 'messages.upsert' || !eMensagemDoPai(payload)) {
        res.writeHead(200)
        res.end('ok')
        return
      }

      const texto = extrairTexto(payload)
      if (!texto) {
        res.writeHead(200)
        res.end('ok')
        return
      }

      console.log(`Mensagem recebida do pai: "${texto}"`)
      await onMensagem(texto.trim())

      res.writeHead(200)
      res.end('ok')
    } catch (err) {
      console.error('Erro ao processar webhook:', err)
      res.writeHead(400)
      res.end('erro')
    }
    return
  }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok' }))
    return
  }

  res.writeHead(404)
  res.end('not found')
})

export function iniciarWebhook(): void {
  server.listen(PORT, () => {
    console.log(`Webhook escutando na porta ${PORT}`)
  })
}
