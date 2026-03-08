import { calcularLivre, type Obrigacao } from "@guigo/shared";

export async function processarFaturamento(
  receitaBruta: number,
  obrigacoes: Obrigacao[],
  gasolinaDiaria: number
): Promise<{
  livre: number;
  totalReservado: number;
  receitaLiquida: number;
  detalhes: string;
}> {
  const resultado = calcularLivre(receitaBruta, obrigacoes, gasolinaDiaria);

  const linhas = [
    `Hoje você pode gastar: R$${Math.max(0, resultado.livre)}`,
    "",
    `Faturou: R$${receitaBruta}`,
    `Gasolina (estimado): -R$${gasolinaDiaria}`,
  ];

  for (const env of resultado.envelopes) {
    linhas.push(`${env.nome}: -R$${env.cotaDiaria} (reservado)`);
  }

  if (resultado.livre < 0) {
    linhas.push("");
    linhas.push(
      `⚠️ Dia apertado. Ficou R$${Math.abs(resultado.livre)} abaixo.`
    );
  }

  return {
    livre: resultado.livre,
    totalReservado: resultado.totalReservado,
    receitaLiquida: resultado.receitaLiquida,
    detalhes: linhas.join("\n"),
  };
}
