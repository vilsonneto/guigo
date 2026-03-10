/**
 * Testa conexao com o Supabase.
 * Uso: npx tsx scripts/test-conexao.ts
 *
 * Requer SUPABASE_URL e SUPABASE_SERVICE_KEY no .env
 */

import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY

if (!url || !key) {
  console.error('Defina SUPABASE_URL e SUPABASE_SERVICE_KEY no .env')
  process.exit(1)
}

const supabase = createClient(url, key)

async function testar(): Promise<void> {
  console.log(`Conectando em ${url}...\n`)

  // 1. Testar leitura das obrigacoes
  const { data: obrigacoes, error } = await supabase
    .from('obrigacoes')
    .select('*')
    .order('cota_diaria', { ascending: false })

  if (error) {
    console.error('Erro ao ler obrigacoes:', error.message)
    process.exit(1)
  }

  console.log(`Obrigacoes encontradas: ${obrigacoes.length}`)
  console.log('---')

  let totalDiario = 0
  for (const ob of obrigacoes) {
    console.log(`  ${ob.nome}: R$${ob.cota_diaria}/dia (${ob.ciclo})`)
    totalDiario += Number(ob.cota_diaria)
  }

  console.log('---')
  console.log(`Custo diario total: R$${totalDiario}`)
  console.log(`Esperado: R$225`)
  console.log(`Status: ${totalDiario === 225 ? 'OK' : 'DIVERGENTE'}`)

  // 2. Verificar tabelas existem
  const tabelas = ['dias', 'envelopes', 'mensagens', 'admin_log']
  console.log('\nVerificando tabelas...')

  for (const tabela of tabelas) {
    const { error: err } = await supabase.from(tabela).select('id').limit(1)
    const status = err ? `ERRO: ${err.message}` : 'OK'
    console.log(`  ${tabela}: ${status}`)
  }

  console.log('\nConexao OK!')
}

testar()
