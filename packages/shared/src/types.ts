export interface Obrigacao {
  id: string;
  nome: string;
  valorTotal: number;
  ciclo: "semanal" | "mensal";
  cotaDiaria: number;
  ativo: boolean;
  validoAte: string | null;
}

export interface Dia {
  id: string;
  data: string;
  receitaBruta: number | null;
  gasolinaEstimada: number;
  receitaLiquida: number | null;
  totalReservado: number | null;
  livre: number | null;
  status: "validado" | "suspeito" | "invalidado" | "editado";
  fonte: "whatsapp" | "admin" | "pluggy";
}

export interface Envelope {
  id: string;
  obrigacaoId: string;
  saldoAcumulado: number;
  metaCiclo: number;
  cicloInicio: string | null;
  pago: boolean;
  pagoEm: string | null;
}

export interface ResultadoCalculo {
  receitaLiquida: number;
  totalReservado: number;
  livre: number;
  envelopes: {
    nome: string;
    cotaDiaria: number;
  }[];
}
