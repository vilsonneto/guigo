import cron from 'node-cron'
import { perguntarFaturamento, enviarResumoSemanal, responderFaturamento } from './whatsapp.js'
import { carregarObrigacoes } from './supabase.js'
import { processarFaturamento } from './envelope.js'
import { iniciarWebhook, setMessageHandler } from './webhook.js'

const GASOLINA_DIARIA = Number(process.env.GASOLINA_DIARIA ?? 120)

console.log('Guigo bot iniciado')

// Handler de mensagens recebidas do pai
setMessageHandler(async (texto: string) => {
  const valor = Number(texto)

  if (isNaN(valor)) {
    // TODO (#4): tratar comandos "quanto", "semana" e texto nao reconhecido
    console.log(`Mensagem nao numerica ignorada: "${texto}"`)
    return
  }

  const obrigacoes = await carregarObrigacoes()
  const resultado = await processarFaturamento(valor, obrigacoes, GASOLINA_DIARIA)

  // TODO (#19): persistir dia, envelopes e mensagem no Supabase

  await responderFaturamento(valor, resultado.livre, resultado.detalhes)
  console.log(`Faturamento processado: R$${valor} -> livre R$${resultado.livre}`)
})

// Webhook para receber mensagens do Evolution API
iniciarWebhook()

// Todo dia as 21h: pergunta faturamento
cron.schedule('0 21 * * *', () => {
  console.log('Enviando pergunta de faturamento...')
  perguntarFaturamento()
})

// Domingo as 20h: resumo semanal
cron.schedule('0 20 * * 0', () => {
  console.log('Enviando resumo semanal...')
  enviarResumoSemanal()
})
