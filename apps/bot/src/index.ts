import cron from 'node-cron'
import { validarEnvio } from '@guigo/shared'
import {
  perguntarFaturamento,
  enviarResumoSemanal,
  responderFaturamento,
  enviarMensagem,
} from './whatsapp.js'
import { carregarObrigacoes } from './supabase.js'
import { processarFaturamento } from './envelope.js'
import { iniciarWebhook, setMessageHandler } from './webhook.js'
import { parsearValor } from './parser.js'
import { buscarDiaHoje, salvarDia, atualizarEnvelopes, registrarMensagem } from './persistencia.js'

const GASOLINA_DIARIA = Number(process.env.GASOLINA_DIARIA ?? 120)

// Estado de confirmacao pendente (valor suspeito aguardando "sim")
let confirmacaoPendente: number | null = null

console.log('Guigo bot iniciado')

async function processarValor(valor: number): Promise<void> {
  const diaExistente = await buscarDiaHoje()
  if (diaExistente) {
    await enviarMensagem(
      `Ja tem registro pra hoje (R$${diaExistente.receita_bruta}). Pelo admin da pra corrigir.`,
    )
    return
  }

  const obrigacoes = await carregarObrigacoes()
  const resultado = await processarFaturamento(valor, obrigacoes, GASOLINA_DIARIA)

  const suspeita = validarEnvio(valor)
  const status = suspeita ? 'suspeito' : 'validado'

  await salvarDia(
    valor,
    GASOLINA_DIARIA,
    resultado.receitaLiquida,
    resultado.totalReservado,
    resultado.livre,
    status,
  )
  await atualizarEnvelopes()
  await registrarMensagem('recebida', String(valor))

  await responderFaturamento(valor, resultado.livre, resultado.detalhes)
  await registrarMensagem('enviada', resultado.detalhes)

  console.log(`Faturamento processado: R$${valor} -> livre R$${resultado.livre} [${status}]`)
}

// Handler de mensagens recebidas do pai
setMessageHandler(async (texto: string) => {
  const textoLower = texto.toLowerCase()

  // Confirmacao de valor suspeito
  if (confirmacaoPendente !== null) {
    if (textoLower === 'sim' || textoLower === 's') {
      const valor = confirmacaoPendente
      confirmacaoPendente = null
      await processarValor(valor)
    } else {
      confirmacaoPendente = null
      await enviarMensagem('Ok, valor descartado. Manda o valor correto quando quiser.')
    }
    return
  }

  const valor = parsearValor(texto)

  if (valor === null) {
    // TODO (#22): tratar comandos "quanto", "semana" e texto nao reconhecido
    console.log(`Mensagem nao reconhecida: "${texto}"`)
    return
  }

  // Validar se o valor parece suspeito
  const suspeita = validarEnvio(valor)
  if (suspeita) {
    confirmacaoPendente = valor
    await enviarMensagem(
      `R$${valor} parece estranho (${suspeita}). Confirma? Responde "sim" pra registrar ou qualquer outra coisa pra cancelar.`,
    )
    await registrarMensagem('recebida', texto)
    return
  }

  await processarValor(valor)
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
