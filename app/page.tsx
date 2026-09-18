import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Quiz Claude Code</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Badge>avancado</Badge>
          <p className="text-sm text-muted-foreground">
            Sanity check do pipeline de estilo (shadcn/ui + Tailwind).
          </p>
          <Button>Jogar</Button>
        </CardContent>
      </Card>
    </div>
  );
}
