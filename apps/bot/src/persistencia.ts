import { supabase, carregarObrigacoes } from './supabase.js'
import { dataHojeBrasilia } from './parser.js'

interface DiaRow {
  id: string
  data: string
  receita_bruta: number
}

export async function buscarDiaHoje(): Promise<DiaRow | null> {
  const hoje = dataHojeBrasilia()

  const { data, error } = await supabase
    .from('dias')
    .select('id, data, receita_bruta')
    .eq('data', hoje)
    .maybeSingle()

  if (error) {
    throw new Error(`Erro ao buscar dia: ${error.message}`)
  }

  return data as DiaRow | null
}

export async function salvarDia(
  receitaBruta: number,
  gasolinaEstimada: number,
  receitaLiquida: number,
  totalReservado: number,
  livre: number,
  status: string,
): Promise<string> {
  const hoje = dataHojeBrasilia()

  const { data, error } = await supabase
    .from('dias')
    .insert({
      data: hoje,
      receita_bruta: receitaBruta,
      gasolina_estimada: gasolinaEstimada,
      receita_liquida: receitaLiquida,
      total_reservado: totalReservado,
      livre,
      status,
      fonte: 'whatsapp',
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(`Erro ao salvar dia: ${error.message}`)
  }

  return data.id as string
}

export async function atualizarEnvelopes(): Promise<void> {
  const obrigacoes = await carregarObrigacoes()

  for (const obrigacao of obrigacoes) {
    const { data: envelope, error: selectError } = await supabase
      .from('envelopes')
      .select('id, saldo_acumulado')
      .eq('obrigacao_id', obrigacao.id)
      .eq('pago', false)
      .maybeSingle()

    if (selectError) {
      console.error(`Erro ao buscar envelope de ${obrigacao.nome}:`, selectError.message)
      continue
    }

    if (envelope) {
      const { error: updateError } = await supabase
        .from('envelopes')
        .update({
          saldo_acumulado: Number(envelope.saldo_acumulado) + obrigacao.cotaDiaria,
          updated_at: new Date().toISOString(),
        })
        .eq('id', envelope.id)

      if (updateError) {
        console.error(`Erro ao atualizar envelope de ${obrigacao.nome}:`, updateError.message)
      }
    } else {
      const { error: insertError } = await supabase.from('envelopes').insert({
        obrigacao_id: obrigacao.id,
        saldo_acumulado: obrigacao.cotaDiaria,
        meta_ciclo: obrigacao.valorTotal,
        ciclo_inicio: dataHojeBrasilia(),
      })

      if (insertError) {
        console.error(`Erro ao criar envelope de ${obrigacao.nome}:`, insertError.message)
      }
    }
  }
}

export async function registrarMensagem(
  direcao: 'recebida' | 'enviada',
  conteudo: string,
): Promise<void> {
  const { error } = await supabase.from('mensagens').insert({
    direcao,
    conteudo,
    processada: direcao === 'recebida',
  })

  if (error) {
    console.error('Erro ao registrar mensagem:', error.message)
  }
}
