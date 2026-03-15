import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SUPPORTED_LANGUAGES } from "@/data/questions";
import { Terminal, ChevronRight, Sparkles, Code2, Zap } from "lucide-react";
import heroImage from "@/assets/hero-dev.png";

interface IntakeFormProps {
  onStart: (name: string, language: string, questionCount: number) => void;
}

const QUESTION_COUNTS = [5, 10, 15, 20, 25, 30];

export default function IntakeForm({ onStart }: IntakeFormProps) {
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
  const [step, setStep] = useState(0); // 0=name, 1=language, 2=count

  const canStart = name.trim().length > 0 && language !== "";

  const languageIcons: Record<string, string> = {
    python: "🐍",
    javascript: "⚡",
    typescript: "🔷",
    java: "☕",
    cpp: "⚙️",
  };

  return (
    <div className="min-h-svh flex flex-col items-center justify-center p-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-lg space-y-10"
      >
        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="relative rounded-xl overflow-hidden border border-border/50 glow-cyan"
        >
          <img
            src={heroImage}
            alt="Futuristic developer workspace with holographic code interfaces"
            className="w-full h-40 sm:h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        </motion.div>
        {/* Header with animated accent */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-[0.2em]"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <Terminal className="w-4 h-4" />
            </motion.div>
            <span>Developer Assessment</span>
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="ml-auto"
            >
              <Sparkles className="w-3 h-3" />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl sm:text-4xl font-semibold tracking-tight"
          >
            Test your{" "}
            <span className="relative inline-block">
              knowledge
              <motion.span
                className="absolute -bottom-1 left-0 h-0.5 bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.8, duration: 0.5 }}
              />
            </span>
            .
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground text-sm leading-relaxed max-w-md"
          >
            A focused technical assessment with{" "}
            <span className="text-primary font-medium">AI-powered analysis</span>{" "}
            of your skill profile. No account required.
          </motion.p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Name */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-2"
          >
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Code2 className="w-3 h-3" />
              Your Name
            </label>
            <div className="relative group">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (e.target.value.trim() && step === 0) setStep(1);
                }}
                placeholder="Enter your name"
                className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-mono text-sm"
              />
              <motion.div
                className="absolute inset-0 rounded-lg pointer-events-none"
                animate={name ? { boxShadow: "0 0 20px hsla(185, 80%, 55%, 0.08)" } : { boxShadow: "none" }}
              />
            </div>
          </motion.div>

          {/* Language */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-2"
          >
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Zap className="w-3 h-3" />
              Language
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SUPPORTED_LANGUAGES.map((lang, i) => (
                <motion.button
                  key={lang.value}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.65 + i * 0.05 }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setLanguage(lang.value);
                    if (step < 2) setStep(2);
                  }}
                  className={`px-4 py-3 rounded-lg border text-sm font-mono transition-all flex items-center gap-2 justify-center ${
                    language === lang.value
                      ? "border-primary/50 bg-primary/10 text-primary glow-cyan"
                      : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  <span>{languageIcons[lang.value]}</span>
                  {lang.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Question Count */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-2"
          >
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
              Depth — <span className="text-primary">{questionCount}</span> Questions
            </label>
            <div className="flex gap-2">
              {QUESTION_COUNTS.map((count, i) => (
                <motion.button
                  key={count}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 + i * 0.04 }}
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setQuestionCount(count)}
                  className={`flex-1 py-2.5 rounded-lg border text-sm font-mono transition-all tabular-nums ${
                    questionCount === count
                      ? "border-primary/50 bg-primary/10 text-primary glow-cyan"
                      : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {count}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Start Button */}
        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          whileHover={{ scale: canStart ? 1.02 : 1, y: canStart ? -2 : 0 }}
          whileTap={{ scale: canStart ? 0.98 : 1 }}
          onClick={() => canStart && onStart(name.trim(), language, questionCount)}
          disabled={!canStart}
          className={`w-full py-4 rounded-lg font-mono text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all relative overflow-hidden ${
            canStart
              ? "bg-primary text-primary-foreground glow-cyan hover:brightness-110"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          {canStart && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            Begin Assessment
            <ChevronRight className="w-4 h-4" />
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
}
