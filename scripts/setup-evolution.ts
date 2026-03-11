/**
 * Cria instancia no Evolution API e exibe QR Code.
 * Uso: npm run evo:setup
 *
 * Requer EVOLUTION_API_URL e EVOLUTION_API_KEY no .env
 * O Evolution API precisa estar rodando (docker compose up -d)
 */

import { writeFileSync } from 'node:fs'

const API_URL = process.env.EVOLUTION_API_URL ?? 'http://localhost:8080'
const API_KEY = process.env.EVOLUTION_API_KEY ?? ''
const INSTANCE = process.env.EVOLUTION_INSTANCE ?? 'guigo'

if (!API_KEY) {
  console.error('Defina EVOLUTION_API_KEY no .env')
  process.exit(1)
}

interface QrCodeResponse {
  instance: { instanceName: string; instanceId: string; status: string }
  hash: { apikey: string }
  qrcode?: { code: string; base64: string }
}

interface ConnectResponse {
  pairingCode?: string
  code?: string
  base64?: string
  count?: number
}

async function criarInstancia(): Promise<void> {
  console.log(`Criando instancia "${INSTANCE}" em ${API_URL}...\n`)

  const res = await fetch(`${API_URL}/instance/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: API_KEY,
    },
    body: JSON.stringify({
      instanceName: INSTANCE,
      integration: 'WHATSAPP-BAILEYS',
      qrcode: true,
      rejectCall: false,
      groupsIgnore: true,
      alwaysOnline: false,
      readMessages: false,
      readStatus: false,
      syncFullHistory: false,
    }),
  })

  if (!res.ok) {
    const body = await res.text()

    if (res.status === 403 && body.includes('already')) {
      console.log('Instancia ja existe. Buscando QR Code...\n')
      await conectarInstancia()
      return
    }

    console.error(`Erro ${res.status}: ${body}`)
    process.exit(1)
  }

  const data = (await res.json()) as QrCodeResponse
  console.log(`Instancia criada: ${data.instance.instanceName}`)
  console.log(`Status: ${data.instance.status}`)

  if (data.qrcode?.base64) {
    salvarQrCode(data.qrcode.base64)
  } else {
    console.log('\nQR Code nao retornado na criacao. Buscando...')
    await conectarInstancia()
  }
}

async function conectarInstancia(): Promise<void> {
  const res = await fetch(`${API_URL}/instance/connect/${INSTANCE}`, {
    headers: { apikey: API_KEY },
  })

  if (!res.ok) {
    const body = await res.text()
    console.error(`Erro ao conectar: ${res.status} ${body}`)
    process.exit(1)
  }

  const data = (await res.json()) as ConnectResponse

  if (data.base64) {
    salvarQrCode(data.base64)
  } else if (data.pairingCode) {
    console.log(`\nCodigo de pareamento: ${data.pairingCode}`)
    console.log('Use no WhatsApp: Configuracoes > Aparelhos conectados > Conectar com numero')
  } else {
    console.log('Instancia ja esta conectada!')
    await verificarStatus()
  }
}

function salvarQrCode(base64: string): void {
  const path = 'scripts/qrcode.html'
  const html = `<!DOCTYPE html>
<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;background:#111">
<div style="text-align:center;color:#fff;font-family:sans-serif">
<h2>Guigo - QR Code WhatsApp</h2>
<p>Escaneie com o WhatsApp do pai</p>
<img src="${base64}" style="width:400px;height:400px" />
<p style="color:#888">Configuracoes > Aparelhos conectados > Conectar um aparelho</p>
</div></body></html>`

  writeFileSync(path, html)
  console.log(`\nQR Code salvo em ${path}`)
  console.log('Abra no navegador para escanear.')
}

async function verificarStatus(): Promise<void> {
  const res = await fetch(`${API_URL}/instance/connectionState/${INSTANCE}`, {
    headers: { apikey: API_KEY },
  })

  if (res.ok) {
    const data = (await res.json()) as { instance: { state: string } }
    console.log(`Estado da conexao: ${data.instance.state}`)
  }
}

criarInstancia()
