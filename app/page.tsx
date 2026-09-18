import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Quiz Claude Code</CardTitle>
          <CardDescription>
            Teste seus conhecimentos sobre Claude Code e o Claude Agent SDK em um quiz rápido de
            Verdadeiro ou Falso.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          <Button size="lg" className="w-full" render={<Link href="/jogar" />}>
            Jogar
          </Button>
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
            Entrar para salvar seu histórico
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
