import type { Obrigacao, ResultadoCalculo } from './types.js'

/**
 * Calcula quanto do faturamento diario e livre pra gastar.
 *
 * Logica:
 * 1. Desconta gasolina (estimada) da receita bruta
 * 2. Separa a cota diaria de cada obrigacao ativa
 * 3. O que sobra e dinheiro livre
 */
export function calcularLivre(
  receitaBruta: number,
  obrigacoes: Obrigacao[],
  gasolinaDiaria: number,
): ResultadoCalculo {
  const receitaLiquida = receitaBruta - gasolinaDiaria

  const obrigacoesAtivas = obrigacoes.filter((o) => o.ativo)

  const envelopes = obrigacoesAtivas.map((o) => ({
    nome: o.nome,
    cotaDiaria: o.cotaDiaria,
  }))

  const totalReservado = obrigacoesAtivas.reduce((sum, o) => sum + o.cotaDiaria, 0)

  const livre = receitaLiquida - totalReservado

  return {
    receitaLiquida,
    totalReservado,
    livre,
    envelopes,
  }
}

/**
 * Valida se um envio de faturamento parece suspeito.
 * Retorna null se ok, ou a razao da suspeita.
 */
export function validarEnvio(valor: number): string | null {
  if (valor < 200) return 'Valor muito baixo (< R$200) — possível erro de digitação'
  if (valor > 600) return 'Valor muito alto (> R$600) — possível acumulado de 2+ dias'
  return null
}
