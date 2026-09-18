import { z } from "zod";

export const questionSchema = z.object({
  statement: z.string().min(10, "Enunciado muito curto."),
  correctAnswer: z.boolean(),
  explanation: z.string().min(10, "Explicação muito curta."),
  category: z.enum(["negocio", "cli_basico", "avancado"]),
  level: z.enum(["basico", "intermediario", "avancado"]),
  isActive: z.boolean(),
});

export type QuestionFormValues = z.infer<typeof questionSchema>;
