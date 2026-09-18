"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { questionSchema, type QuestionFormValues } from "@/lib/quiz/question-schema";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const CATEGORY_OPTIONS: { value: QuestionFormValues["category"]; label: string }[] = [
  { value: "negocio", label: "Negócio" },
  { value: "cli_basico", label: "CLI básico" },
  { value: "avancado", label: "Avançado" },
];

const LEVEL_OPTIONS: { value: QuestionFormValues["level"]; label: string }[] = [
  { value: "basico", label: "Básico" },
  { value: "intermediario", label: "Intermediário" },
  { value: "avancado", label: "Avançado" },
];

type Props = {
  defaultValues?: Partial<QuestionFormValues>;
  onSubmit: (values: QuestionFormValues) => Promise<{ ok: boolean; error?: string }>;
  submitLabel: string;
};

export function QuestionForm({ defaultValues, onSubmit, submitLabel }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      statement: "",
      correctAnswer: true,
      explanation: "",
      category: "negocio",
      level: "basico",
      isActive: true,
      ...defaultValues,
    },
  });

  async function submit(values: QuestionFormValues) {
    setServerError(null);
    const result = await onSubmit(values);
    if (!result.ok) {
      setServerError(result.error ?? "Não foi possível salvar.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="statement">Enunciado</Label>
        <Textarea id="statement" rows={3} {...register("statement")} />
        {errors.statement && (
          <p className="text-sm text-destructive">{errors.statement.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Resposta correta</Label>
        <Controller
          control={control}
          name="correctAnswer"
          render={({ field }) => (
            <Select
              value={field.value ? "true" : "false"}
              onValueChange={(value) => field.onChange(value === "true")}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Verdadeiro</SelectItem>
                <SelectItem value="false">Falso</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="explanation">Explicação</Label>
        <Textarea id="explanation" rows={3} {...register("explanation")} />
        {errors.explanation && (
          <p className="text-sm text-destructive">{errors.explanation.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label>Categoria</Label>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Nível</Label>
          <Controller
            control={control}
            name="level"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVEL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <Switch id="isActive" checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
        <Label htmlFor="isActive">Ativa (aparece no jogo)</Label>
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : submitLabel}
      </Button>
    </form>
  );
}
