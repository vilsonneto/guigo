/**
 * Testa envio de mensagem via Evolution API.
 * Uso: npm run evo:test
 *
 * Requer Evolution API rodando e instancia conectada.
 */

const API_URL = process.env.EVOLUTION_API_URL ?? 'http://localhost:8080'
const API_KEY = process.env.EVOLUTION_API_KEY ?? ''
const INSTANCE = process.env.EVOLUTION_INSTANCE ?? 'guigo'
const MOTORISTA = process.env.MOTORISTA_WHATSAPP ?? ''

if (!API_KEY || !MOTORISTA) {
  console.error('Defina EVOLUTION_API_KEY e MOTORISTA_WHATSAPP no .env')
  process.exit(1)
}

async function verificarConexao(): Promise<boolean> {
  const res = await fetch(`${API_URL}/instance/connectionState/${INSTANCE}`, {
    headers: { apikey: API_KEY },
  })

  if (!res.ok) {
    console.error(`Erro ao verificar conexao: ${res.status}`)
    return false
  }

  const data = (await res.json()) as { instance: { state: string } }
  console.log(`Estado: ${data.instance.state}`)
  return data.instance.state === 'open'
}

async function enviarMensagemTeste(): Promise<void> {
  console.log(`Enviando mensagem de teste para ${MOTORISTA}...\n`)

  const res = await fetch(`${API_URL}/message/sendText/${INSTANCE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: API_KEY,
    },
    body: JSON.stringify({
      number: MOTORISTA,
      text: 'Teste do Guigo bot. Se voce recebeu essa mensagem, esta tudo funcionando!',
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error(`Erro ao enviar: ${res.status} ${body}`)
    process.exit(1)
  }

  console.log('Mensagem enviada com sucesso!')
}

async function testar(): Promise<void> {
  console.log(`Evolution API: ${API_URL}`)
  console.log(`Instancia: ${INSTANCE}\n`)

  const conectado = await verificarConexao()

  if (!conectado) {
    console.error('\nInstancia nao esta conectada. Rode npm run evo:setup primeiro.')
    process.exit(1)
  }

  await enviarMensagemTeste()
}

testar()
