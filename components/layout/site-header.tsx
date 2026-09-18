import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.is_admin === true;
  }

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold">
          Quiz Claude Code
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/jogar" className="text-muted-foreground hover:text-foreground">
            Jogar
          </Link>
          {user ? (
            <>
              <Link href="/historico" className="text-muted-foreground hover:text-foreground">
                Meu histórico
              </Link>
              {isAdmin && (
                <Link href="/admin" className="text-muted-foreground hover:text-foreground">
                  Admin
                </Link>
              )}
              <form action={signOut}>
                <Button type="submit" variant="ghost" size="sm">
                  Sair
                </Button>
              </form>
            </>
          ) : (
            <Link href="/login" className="text-muted-foreground hover:text-foreground">
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
