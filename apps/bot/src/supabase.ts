import { createClient } from '@supabase/supabase-js'
import type { Obrigacao } from '@guigo/shared'

const supabaseUrl = process.env.SUPABASE_URL ?? ''
const supabaseKey = process.env.SUPABASE_SERVICE_KEY ?? ''

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL e SUPABASE_SERVICE_KEY precisam estar definidos')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

let cacheObrigacoes: Obrigacao[] | null = null

export async function carregarObrigacoes(): Promise<Obrigacao[]> {
  if (cacheObrigacoes) return cacheObrigacoes

  const { data, error } = await supabase
    .from('obrigacoes')
    .select('id, nome, valor_total, ciclo, cota_diaria, ativo, valido_ate')
    .eq('ativo', true)

  if (error) {
    throw new Error(`Erro ao carregar obrigações: ${error.message}`)
  }

  cacheObrigacoes = (data ?? []).map((row) => ({
    id: row.id as string,
    nome: row.nome as string,
    valorTotal: Number(row.valor_total),
    ciclo: row.ciclo as Obrigacao['ciclo'],
    cotaDiaria: Number(row.cota_diaria),
    ativo: row.ativo as boolean,
    validoAte: row.valido_ate as string | null,
  }))

  return cacheObrigacoes
}

export function limparCacheObrigacoes(): void {
  cacheObrigacoes = null
}
