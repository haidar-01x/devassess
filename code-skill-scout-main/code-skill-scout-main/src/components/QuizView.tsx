import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Question } from "@/data/questions";
import { CheckCircle2, XCircle, Zap } from "lucide-react";

interface QuizViewProps {
  questions: Question[];
  onComplete: (answers: Record<string, string>) => void;
  language: string;
}

export default function QuizView({ questions, onComplete, language }: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [streak, setStreak] = useState(0);

  const question = questions[currentIndex];
  const total = questions.length;
  const isCorrect = selectedOption === question.correctOption;
  const isLast = currentIndex === total - 1;

  const handleSelect = (key: string) => {
    if (showFeedback) return;
    setSelectedOption(key);
    setShowFeedback(true);
    setAnswers((prev) => ({ ...prev, [question.id]: key }));
    if (key === question.correctOption) {
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (isLast) {
      onComplete({ ...answers, [question.id]: selectedOption! });
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    }
  };

  const optionClass = (key: string) => {
    if (!showFeedback) {
      return "border-border bg-card hover:border-primary/30 hover:bg-primary/5 text-foreground";
    }
    if (key === question.correctOption) {
      return "border-success/50 bg-success/10 text-success";
    }
    if (key === selectedOption && !isCorrect) {
      return "border-destructive/50 bg-destructive/10 text-destructive";
    }
    return "border-border/50 bg-card/50 text-muted-foreground";
  };

  const correctCount = Object.entries(answers).filter(
    ([qId, ans]) => questions.find((q) => q.id === qId)?.correctOption === ans
  ).length;

  return (
    <div className="min-h-svh flex flex-col items-center justify-center p-6 relative z-10">
      <div className="w-full max-w-2xl">
        {/* Progress Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-end mb-8"
        >
          <div className="space-y-1">
            <span className="text-xs font-mono text-primary uppercase tracking-[0.2em]">
              {language} Assessment
            </span>
            <h2 className="text-xl font-medium">
              Question {currentIndex + 1}{" "}
              <span className="text-muted-foreground font-normal">of {total}</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {streak >= 2 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded-full"
              >
                <Zap className="w-3 h-3" />
                {streak}🔥
              </motion.div>
            )}
            <div className="font-mono text-sm text-muted-foreground tabular-nums">
              {correctCount}/{currentIndex + (showFeedback ? 1 : 0)} correct
            </div>
          </div>
        </motion.div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-border rounded-full mb-8 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + (showFeedback ? 1 : 0)) / total) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 30, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="bg-card border border-border rounded-xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
          >
            {/* Subtle corner accent */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />

            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                {question.topic}
              </span>
              <span className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={i < question.difficulty ? "text-primary" : "text-border"}
                  >
                    ●
                  </motion.span>
                ))}
              </span>
            </div>

            <p className="text-lg leading-relaxed text-balance relative z-10">
              {question.content}
            </p>

            {question.codeSnippet && (
              <pre className="p-4 bg-background rounded-md border border-border font-mono text-sm overflow-x-auto">
                <code>{question.codeSnippet}</code>
              </pre>
            )}

            <div className="grid gap-3">
              {question.options.map((opt, i) => (
                <motion.button
                  key={opt.key}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  whileHover={!showFeedback ? { scale: 1.01, x: 4 } : {}}
                  whileTap={!showFeedback ? { scale: 0.99 } : {}}
                  onClick={() => handleSelect(opt.key)}
                  disabled={showFeedback}
                  className={`w-full text-left px-5 py-4 rounded-lg border transition-all flex items-center gap-3 ${optionClass(opt.key)}`}
                >
                  <span className="font-mono text-xs uppercase opacity-60 w-5 shrink-0">
                    {opt.key})
                  </span>
                  <span className="text-sm flex-1">{opt.text}</span>
                  {showFeedback && opt.key === question.correctOption && (
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  )}
                  {showFeedback && opt.key === selectedOption && !isCorrect && opt.key !== question.correctOption && (
                    <XCircle className="w-4 h-4 text-destructive shrink-0" />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className={`p-4 rounded-lg border text-sm leading-relaxed ${
                    isCorrect
                      ? "border-success/30 bg-success/5 text-success"
                      : "border-destructive/30 bg-destructive/5 text-destructive"
                  }`}>
                    <p className="font-mono text-xs uppercase tracking-widest mb-1 opacity-70 flex items-center gap-1.5">
                      {isCorrect ? (
                        <><CheckCircle2 className="w-3 h-3" /> Correct</>
                      ) : (
                        <><XCircle className="w-3 h-3" /> Incorrect</>
                      )}
                    </p>
                    <p>{question.explanation}</p>
                  </div>

                  <motion.button
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleNext}
                    className="mt-4 w-full py-3 rounded-lg bg-primary text-primary-foreground font-mono text-sm uppercase tracking-widest transition-all hover:brightness-110 relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    />
                    <span className="relative z-10">
                      {isLast ? "View Results →" : "Next Question →"}
                    </span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
