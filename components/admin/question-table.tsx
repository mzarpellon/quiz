"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { deleteQuestion, toggleActive } from "@/app/admin/questions/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Category, Level } from "@/lib/quiz/engine";
import type { Tables } from "@/lib/supabase/database.types";

const CATEGORY_LABELS: Record<Category, string> = {
  negocio: "Negócio",
  cli_basico: "CLI básico",
  avancado: "Avançado",
};

const LEVEL_LABELS: Record<Level, string> = {
  basico: "Básico",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

export function QuestionTable({ questions }: { questions: Tables<"questions">[] }) {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(
    () =>
      questions.filter((question) => {
        if (categoryFilter !== "all" && question.category !== categoryFilter) return false;
        if (levelFilter !== "all" && question.level !== levelFilter) return false;
        return true;
      }),
    [questions, categoryFilter, levelFilter],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <Select
          value={categoryFilter}
          onValueChange={(value) => setCategoryFilter(value ?? "all")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={levelFilter} onValueChange={(value) => setLevelFilter(value ?? "all")}>
          <SelectTrigger>
            <SelectValue placeholder="Nível" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os níveis</SelectItem>
            {Object.entries(LEVEL_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Enunciado</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Nível</TableHead>
            <TableHead>Ativa</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((question) => (
            <TableRow key={question.id}>
              <TableCell className="max-w-xs truncate whitespace-normal">
                {question.statement}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{CATEGORY_LABELS[question.category as Category]}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{LEVEL_LABELS[question.level as Level]}</Badge>
              </TableCell>
              <TableCell>
                <Switch
                  checked={question.is_active}
                  disabled={isPending}
                  onCheckedChange={(checked) =>
                    startTransition(() => {
                      toggleActive(question.id, checked);
                    })
                  }
                />
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    render={<Link href={`/admin/questions/${question.id}/edit`} />}
                  >
                    Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
                      Excluir
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir pergunta?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Considere apenas desativar em vez de
                          excluir.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            startTransition(() => {
                              deleteQuestion(question.id);
                            })
                          }
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
