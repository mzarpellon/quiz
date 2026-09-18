import { QuizResultProvider } from "@/components/quiz/quiz-result-context";

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return <QuizResultProvider>{children}</QuizResultProvider>;
}
