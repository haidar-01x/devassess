import { useState, useCallback } from "react";
import IntakeForm from "@/components/IntakeForm";
import QuizView from "@/components/QuizView";
import ResultsView, { type AIAnalysis } from "@/components/ResultsView";
import ParticleBackground from "@/components/ParticleBackground";
import { getQuestionsForQuiz, type Question } from "@/data/questions";
import { supabase } from "@/integrations/supabase/client";

type Phase = "intake" | "quiz" | "results";

const Index = () => {
  const [phase, setPhase] = useState<Phase>("intake");
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleStart = useCallback((userName: string, lang: string, count: number) => {
    setName(userName);
    setLanguage(lang);
    const qs = getQuestionsForQuiz(lang, count);
    setQuestions(qs);
    setAnswers({});
    setAiAnalysis(null);
    setPhase("quiz");
  }, []);

  const generateLocalAnalysis = useCallback((qs: Question[], ans: Record<string, string>): AIAnalysis => {
    const correctTopics: string[] = [];
    const wrongTopics: string[] = [];
    let hardestMissed: Question | null = null;

    qs.forEach((q) => {
      if (ans[q.id] === q.correctOption) {
        correctTopics.push(q.topic);
      } else {
        wrongTopics.push(q.topic);
        if (!hardestMissed || q.difficulty > hardestMissed.difficulty) {
          hardestMissed = q;
        }
      }
    });

    const correct = correctTopics.length;
    const total = qs.length;
    const score = Math.round((correct / total) * 100);

    const uniqueStrengths = [...new Set(correctTopics)].slice(0, 3);
    const uniqueWeaknesses = [...new Set(wrongTopics)].slice(0, 3);

    const skillLevel = score >= 90 ? "Expert" : score >= 70 ? "Advanced" : score >= 45 ? "Intermediate" : "Beginner";

    return {
      skillLevel,
      strengths: uniqueStrengths.length > 0 ? uniqueStrengths.map(t => `Solid understanding of ${t}`) : ["Keep practicing to build strengths"],
      weaknesses: uniqueWeaknesses.length > 0 ? uniqueWeaknesses.map(t => `Review ${t} concepts`) : ["No significant weaknesses detected — excellent work!"],
      mentorship: score >= 70
        ? `Strong performance, ${name}. Focus on edge cases and system design to reach the next level.`
        : `Good start, ${name}. Focus on fundamentals and practice regularly to build confidence.`,
      deepDive: hardestMissed
        ? `Your most challenging miss was in ${hardestMissed.topic}: "${hardestMissed.content}" — The correct answer was "${hardestMissed.options.find(o => o.key === hardestMissed!.correctOption)?.text}". ${hardestMissed.explanation}`
        : "Perfect score — no missed questions to analyze!",
    };
  }, [name]);

  const handleComplete = useCallback(async (finalAnswers: Record<string, string>) => {
    setAnswers(finalAnswers);
    setPhase("results");
    setAiLoading(true);

    // Build results payload
    const results = questions.map((q) => ({
      question: q.content,
      topic: q.topic,
      difficulty: q.difficulty,
      userAnswer: q.options.find(o => o.key === finalAnswers[q.id])?.text || "",
      correctAnswer: q.options.find(o => o.key === q.correctOption)?.text || "",
      isCorrect: finalAnswers[q.id] === q.correctOption,
      explanation: q.explanation,
    }));

    try {
      const { data, error } = await supabase.functions.invoke("evaluate-quiz", {
        body: { name, language, results },
      });

      if (error) throw error;

      setAiAnalysis({
        skillLevel: data.skillLevel || "Intermediate",
        strengths: data.strengths || [],
        weaknesses: data.weaknesses || [],
        mentorship: data.mentorship || "",
        deepDive: data.deepDive || "",
      });
    } catch (err) {
      console.error("AI evaluation failed, using local fallback:", err);
      const analysis = generateLocalAnalysis(questions, finalAnswers);
      setAiAnalysis(analysis);
    } finally {
      setAiLoading(false);
    }
  }, [questions, name, language, generateLocalAnalysis]);

  const handleRestart = useCallback(() => {
    setPhase("intake");
    setName("");
    setLanguage("");
    setQuestions([]);
    setAnswers({});
    setAiAnalysis(null);
  }, []);

  const langLabel = language.charAt(0).toUpperCase() + language.slice(1);

  return (
    <>
      <ParticleBackground />
      {phase === "intake" && <IntakeForm onStart={handleStart} />}
      {phase === "quiz" && (
        <QuizView
          questions={questions}
          onComplete={handleComplete}
          language={langLabel}
        />
      )}
      {phase === "results" && (
        <ResultsView
          name={name}
          language={langLabel}
          questions={questions}
          answers={answers}
          onRestart={handleRestart}
          aiAnalysis={aiAnalysis}
          aiLoading={aiLoading}
        />
      )}
    </>
  );
};

export default Index;
