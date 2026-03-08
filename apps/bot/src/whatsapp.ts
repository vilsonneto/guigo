import axios from "axios";

const API_URL = process.env.EVOLUTION_API_URL ?? "http://localhost:8080";
const API_KEY = process.env.EVOLUTION_API_KEY ?? "";
const INSTANCE = process.env.EVOLUTION_INSTANCE ?? "guigo";
const MOTORISTA = process.env.MOTORISTA_WHATSAPP ?? "";

async function enviarMensagem(texto: string): Promise<void> {
  await axios.post(
    `${API_URL}/message/sendText/${INSTANCE}`,
    {
      number: MOTORISTA,
      text: texto,
    },
    {
      headers: { apikey: API_KEY },
    }
  );
}

export async function perguntarFaturamento(): Promise<void> {
  await enviarMensagem(
    "E aí pai, quanto faturou hoje? (bruto, sem descontar nada)"
  );
}

export async function enviarResumoSemanal(): Promise<void> {
  // TODO: buscar dados da semana no Supabase e montar resumo
  await enviarMensagem("Resumo semanal em breve...");
}

export async function responderFaturamento(
  receita: number,
  livre: number,
  detalhes: string
): Promise<void> {
  await enviarMensagem(detalhes);
}
