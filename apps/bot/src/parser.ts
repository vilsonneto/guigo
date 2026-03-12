/**
 * Parseia texto do pai como valor monetario.
 * Aceita: "370", "370.00", "370,50", "R$370", "R$ 370,50"
 * Retorna null se nao for numero valido.
 */
export function parsearValor(texto: string): number | null {
  const limpo = texto.replace(/r\$/gi, '').replace(/\s/g, '').replace(',', '.')

  const valor = Number(limpo)

  if (isNaN(valor) || valor <= 0) return null

  return Math.ceil(valor)
}

/**
 * Retorna a data de hoje no fuso de Brasilia (YYYY-MM-DD).
 */
export function dataHojeBrasilia(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
}
