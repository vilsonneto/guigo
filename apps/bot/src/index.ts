import cron from "node-cron";
import { perguntarFaturamento, enviarResumoSemanal } from "./whatsapp.js";

console.log("Guigo bot iniciado");

// Todo dia as 21h: pergunta faturamento
cron.schedule("0 21 * * *", () => {
  console.log("Enviando pergunta de faturamento...");
  perguntarFaturamento();
});

// Domingo as 20h: resumo semanal
cron.schedule("0 20 * * 0", () => {
  console.log("Enviando resumo semanal...");
  enviarResumoSemanal();
});
