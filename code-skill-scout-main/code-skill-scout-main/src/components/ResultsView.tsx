import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Question } from "@/data/questions";
import { RotateCcw, Target, TrendingUp, AlertTriangle, BookOpen, Trophy, Award, Star } from "lucide-react";

interface ResultsViewProps {
  name: string;
  language: string;
  questions: Question[];
  answers: Record<string, string>;
  onRestart: () => void;
  aiAnalysis?: AIAnalysis | null;
  aiLoading?: boolean;
}

export interface AIAnalysis {
  skillLevel: string;
  strengths: string[];
  weaknesses: string[];
  mentorship: string;
  deepDive: string;
}

export default function ResultsView({
  name,
  language,
  questions,
  answers,
  onRestart,
  aiAnalysis,
  aiLoading,
}: ResultsViewProps) {
  const { score, correct, total, topicBreakdown } = useMemo(() => {
    let correct = 0;
    const topicMap: Record<string, { correct: number; total: number }> = {};

    questions.forEach((q) => {
      const isCorrect = answers[q.id] === q.correctOption;
      if (isCorrect) correct++;

      if (!topicMap[q.topic]) topicMap[q.topic] = { correct: 0, total: 0 };
      topicMap[q.topic].total++;
      if (isCorrect) topicMap[q.topic].correct++;
    });

    return {
      score: Math.round((correct / questions.length) * 100),
      correct,
      total: questions.length,
      topicBreakdown: topicMap,
    };
  }, [questions, answers]);

  const localSkillLevel = score >= 90 ? "Expert" : score >= 70 ? "Advanced" : score >= 45 ? "Intermediate" : "Beginner";

  const displayLevel = aiAnalysis?.skillLevel || localSkillLevel;
  const levelColor =
    displayLevel === "Expert" ? "text-primary" :
    displayLevel === "Advanced" ? "text-success" :
    displayLevel === "Intermediate" ? "text-yellow-400" :
    "text-muted-foreground";

  const levelIcon =
    displayLevel === "Expert" ? <Trophy className="w-6 h-6" /> :
    displayLevel === "Advanced" ? <Award className="w-6 h-6" /> :
    displayLevel === "Intermediate" ? <Star className="w-6 h-6" /> :
    <Target className="w-6 h-6" />;

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  };

  return (
    <div className="min-h-svh flex flex-col items-center justify-center p-6 relative z-10">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-2xl space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="space-y-1">
          <span className="text-xs font-mono text-primary uppercase tracking-[0.2em]">
            Assessment Complete
          </span>
          <h1 className="text-2xl sm:text-3xl font-semibold">
            Technical Profile — {name}
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            {language.toUpperCase()} · {total} questions
          </p>
        </motion.div>

        {/* Score Card */}
        <motion.div
          variants={itemVariants}
          className="bg-card border border-border rounded-xl p-6 sm:p-8 space-y-6 relative overflow-hidden"
        >
          {/* Background glow for high scores */}
          {score >= 80 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-success/5 pointer-events-none"
            />
          )}

          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">Score</p>
              <motion.p
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="text-5xl font-bold font-mono tabular-nums"
              >
                {score}%
              </motion.p>
              <p className="text-sm text-muted-foreground mt-1">{correct}/{total} correct</p>
            </div>
            <div className="text-right flex flex-col items-end gap-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.4 }}
                className={levelColor}
              >
                {levelIcon}
              </motion.div>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Level</p>
              <p className={`text-2xl font-bold ${levelColor}`}>{displayLevel}</p>
            </div>
          </div>

          {/* Topic Breakdown */}
          <div className="space-y-3">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
              Topic Breakdown
            </p>
            <div className="space-y-2">
              {Object.entries(topicBreakdown).map(([topic, data], i) => {
                const pct = Math.round((data.correct / data.total) * 100);
                return (
                  <motion.div
                    key={topic}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-sm text-muted-foreground w-36 truncate">{topic}</span>
                    <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: 0.4 + i * 0.05 }}
                        className={`h-full rounded-full ${pct === 100 ? "bg-success" : pct >= 50 ? "bg-primary" : "bg-destructive"}`}
                      />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground tabular-nums w-12 text-right">
                      {data.correct}/{data.total}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* AI Analysis */}
        {aiLoading && (
          <motion.div
            variants={itemVariants}
            className="bg-card border border-border rounded-xl p-6 space-y-3"
          >
            <div className="flex items-center gap-2 text-primary">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Target className="w-4 h-4" />
              </motion.div>
              <span className="text-xs font-mono uppercase tracking-widest">AI Analysis in Progress…</span>
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="h-4 bg-border rounded"
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                  style={{ width: `${80 - i * 15}%` }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {aiAnalysis && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {/* Strengths */}
            <motion.div variants={itemVariants} className="bg-card border border-border rounded-xl p-6 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-success rounded-r" />
              <div className="flex items-center gap-2 text-success">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-mono uppercase tracking-widest">Strengths</span>
              </div>
              <ul className="space-y-1.5">
                {aiAnalysis.strengths.map((s, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-sm text-foreground/80 flex items-start gap-2"
                  >
                    <span className="text-success mt-0.5">▸</span>
                    {s}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Weaknesses */}
            <motion.div variants={itemVariants} className="bg-card border border-border rounded-xl p-6 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400 rounded-r" />
              <div className="flex items-center gap-2 text-yellow-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-mono uppercase tracking-widest">Areas for Growth</span>
              </div>
              <ul className="space-y-1.5">
                {aiAnalysis.weaknesses.map((w, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-sm text-foreground/80 flex items-start gap-2"
                  >
                    <span className="text-yellow-400 mt-0.5">▸</span>
                    {w}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Mentorship */}
            <motion.div variants={itemVariants} className="bg-card border border-border rounded-xl p-6 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-r" />
              <div className="flex items-center gap-2 text-primary">
                <BookOpen className="w-4 h-4" />
                <span className="text-xs font-mono uppercase tracking-widest">Mentorship</span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{aiAnalysis.mentorship}</p>
            </motion.div>

            {/* Deep Dive */}
            {aiAnalysis.deepDive && (
              <motion.div variants={itemVariants} className="bg-card border border-border rounded-xl p-6 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-r" />
                <div className="flex items-center gap-2 text-primary">
                  <Target className="w-4 h-4" />
                  <span className="text-xs font-mono uppercase tracking-widest">Deep Dive</span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{aiAnalysis.deepDive}</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Restart */}
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRestart}
          className="w-full py-4 rounded-xl border border-border bg-card text-foreground font-mono text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:border-primary/30 hover:glow-cyan transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Start New Assessment
        </motion.button>
      </motion.div>
    </div>
  );
}
