"use client";

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Brain,
  CalendarDays,
  Check,
  ChevronRight,
  Flame,
  LineChart,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Challenge, Skill, categoryMix, generateArchive, generateChallenge, getDailyChallenge } from "@/lib/challenges";

type Scores = Record<Skill, number>;
type MemoryPhase = "ready" | "study" | "recall";

type SessionState = {
  index: number;
  streak: number;
  correct: number;
  attempted: number;
  scores: Scores;
  archive: string[];
  lastDailyKey?: string;
};

const initialScores: Scores = {
  pattern: 64,
  memory: 58,
  logic: 61,
  observation: 67,
  reasoning: 60,
};

const profileNames = [
  { name: "Pattern Seeker", min: 0 },
  { name: "Analytical Thinker", min: 64 },
  { name: "Strategist", min: 72 },
  { name: "Visionary", min: 80 },
  { name: "Mastermind", min: 88 },
];

const leaderboard = [
  { name: "Avery K.", score: 984, style: "Neural Trace" },
  { name: "Mina S.", score: 941, style: "Silent Rule" },
  { name: "Theo R.", score: 917, style: "Rapid Logic" },
  { name: "You", score: 812, style: "Live Session" },
];

function getStoredState(): SessionState {
  if (typeof window === "undefined") {
    return {
      index: 0,
      streak: 7,
      correct: 0,
      attempted: 0,
      scores: initialScores,
      archive: [],
    };
  }

  const raw = window.localStorage.getItem("patternmind-session");
  if (!raw) {
    return {
      index: 0,
      streak: 7,
      correct: 0,
      attempted: 0,
      scores: initialScores,
      archive: [],
    };
  }

  try {
    return { ...JSON.parse(raw), scores: { ...initialScores, ...JSON.parse(raw).scores } };
  } catch {
    return {
      index: 0,
      streak: 7,
      correct: 0,
      attempted: 0,
      scores: initialScores,
      archive: [],
    };
  }
}

function brainScore(scores: Scores) {
  return Math.round(Object.values(scores).reduce((sum, value) => sum + value, 0) / Object.values(scores).length);
}

function brainProfile(score: number) {
  return profileNames.reduce((active, profile) => (score >= profile.min ? profile : active), profileNames[0]).name;
}

function classNames(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(" ");
}

function FloatingParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 34 }, (_, index) => ({
        id: index,
        x: `${Math.round((index * 37) % 100)}%`,
        y: `${Math.round((index * 53) % 100)}%`,
        delay: (index % 9) * 0.45,
        size: 2 + (index % 4),
      })),
    [],
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute left-[-14%] top-[-12%] h-[34rem] w-[34rem] animate-gradient-drift rounded-full bg-cyan-400/18 blur-3xl" />
      <div className="absolute right-[-10%] top-[18%] h-[30rem] w-[30rem] animate-gradient-drift rounded-full bg-fuchsia-500/12 blur-3xl [animation-delay:-6s]" />
      <div className="absolute bottom-[-18%] left-[18%] h-[34rem] w-[34rem] animate-gradient-drift rounded-full bg-emerald-400/12 blur-3xl [animation-delay:-11s]" />
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full bg-white/35"
          style={{ left: particle.x, top: particle.y, width: particle.size, height: particle.size }}
          animate={{ opacity: [0.1, 0.55, 0.1], y: [0, -22, 0], scale: [1, 1.45, 1] }}
          transition={{ duration: 7 + (particle.id % 5), repeat: Infinity, delay: particle.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function MagneticCard({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 160, damping: 22 });
  const springY = useSpring(y, { stiffness: 160, damping: 22 });
  const rotateX = useTransform(springY, [-80, 80], [4, -4]);
  const rotateY = useTransform(springX, [-80, 80], [-4, 4]);

  return (
    <motion.div
      className="glass relative mx-auto w-full max-w-[min(48rem,calc(100vw-2.5rem))] overflow-hidden rounded-[28px] p-5 shadow-glow sm:p-7 lg:p-8"
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        x.set(event.clientX - rect.left - rect.width / 2);
        y.set(event.clientY - rect.top - rect.height / 2);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
      {children}
    </motion.div>
  );
}

function Token({ value, subtle = false }: { value: string; subtle?: boolean }) {
  return (
    <motion.div
      layout
      className={classNames(
        "grid aspect-square min-h-14 w-14 place-items-center rounded-2xl border text-2xl sm:min-h-16 sm:w-16 sm:text-3xl",
        subtle
          ? "border-white/8 bg-white/[0.035] text-white/48"
          : "border-white/12 bg-white/[0.075] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
      )}
      initial={{ scale: 0.86, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      {value}
    </motion.div>
  );
}

function ChallengeVisual({ challenge, memoryPhase = "study" }: { challenge: Challenge; memoryPhase?: MemoryPhase }) {
  if (challenge.mode === "hidden") {
    return (
      <div className="mx-auto grid w-full max-w-md gap-3">
        {challenge.examples?.map((item) => (
          <div key={`${item.label}-${item.mark}`} className="flex items-center justify-between rounded-2xl border border-white/9 bg-white/[0.045] px-4 py-3">
            <span className="text-sm font-medium tracking-[0.18em] text-white/78">{item.label}</span>
            <span className={item.mark === "✓" ? "text-emerald-300" : "text-rose-300"}>{item.mark}</span>
          </div>
        ))}
        <div className="mt-2 rounded-2xl border border-cyan-200/18 bg-cyan-200/[0.055] px-4 py-4 text-center text-xl font-semibold tracking-[0.16em] text-white">
          {challenge.prompt}
        </div>
      </div>
    );
  }

  if (challenge.mode === "matrix") {
    return (
      <div className="mx-auto grid w-full max-w-xs grid-cols-3 gap-3">
        {challenge.visualGrid?.map((item, index) => (
          <motion.div
            key={`${item}-${index}`}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.025 }}
            className={classNames(
              "grid aspect-square place-items-center rounded-2xl border text-2xl sm:text-3xl",
              item === "?"
                ? "border-cyan-200/30 bg-cyan-200/10 text-cyan-100"
                : "border-white/10 bg-white/[0.055] text-white",
            )}
          >
            {item}
          </motion.div>
        ))}
      </div>
    );
  }

  if (challenge.mode === "text") {
    return (
      <div className="mx-auto flex min-h-40 w-full max-w-xl items-center justify-center rounded-3xl border border-cyan-200/16 bg-cyan-200/[0.045] px-6 py-8 text-center">
        <p className="text-xl font-semibold leading-8 text-white sm:text-2xl">{challenge.prompt}</p>
      </div>
    );
  }

  if (challenge.mode === "odd") {
    return (
      <div className="mx-auto grid max-w-xs grid-cols-3 gap-3">
        {challenge.visualGrid?.map((item, index) => (
          <div key={`${item}-${index}`} className="relative grid aspect-square place-items-center rounded-2xl border border-white/10 bg-white/[0.055] text-3xl">
            <span className="absolute left-2 top-1.5 text-[10px] font-semibold text-white/38">{index + 1}</span>
            {item}
          </div>
        ))}
      </div>
    );
  }

  if (challenge.mode === "memory") {
    if (memoryPhase === "ready") {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="mx-auto grid min-h-40 w-full max-w-sm place-items-center rounded-3xl border border-cyan-200/18 bg-cyan-200/[0.055] px-6 py-8 text-center"
        >
          <div>
            <Brain className="mx-auto mb-4 text-cyan-200" size={30} />
            <p className="text-xs font-semibold tracking-[0.34em] text-cyan-100/70">MEMORY</p>
            <p className="mt-3 text-xl font-semibold text-white">Get ready to study the slots</p>
          </div>
        </motion.div>
      );
    }

    const memoryVisible = memoryPhase === "study";

    return (
      <div className="mx-auto grid w-full max-w-lg gap-5">
        <div
          className={classNames(
            "grid justify-items-center gap-2 sm:gap-3",
            (challenge.memoryGrid?.length ?? 0) > 6 ? "grid-cols-4" : "grid-cols-3 sm:grid-cols-6",
          )}
        >
          {challenge.memoryGrid?.map((item, index) => (
            <Token key={`${item}-${index}`} value={memoryVisible ? item : "•"} subtle={!memoryVisible} />
          ))}
        </div>
        {!memoryVisible && <p className="text-center text-sm font-medium text-cyan-100/80">{challenge.memoryQuestion}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {challenge.sequence?.map((item, index) => (
        <Token key={`${challenge.id}-${item}-${index}`} value={item} />
      ))}
    </div>
  );
}

function ChallengeCard({
  challenge,
  selected,
  isCorrect,
  onAnswer,
  onNext,
}: {
  challenge: Challenge;
  selected?: string;
  isCorrect?: boolean;
  onAnswer: (answer: string) => void;
  onNext: () => void;
}) {
  const [memoryPhase, setMemoryPhase] = useState<MemoryPhase>(challenge.mode === "memory" ? "ready" : "study");

  useEffect(() => {
    if (challenge.mode !== "memory") {
      setMemoryPhase("study");
      return;
    }

    setMemoryPhase("ready");
    const readyMs = 1500;
    const studyMs = Math.max(4800, 6100 - challenge.difficulty * 80);
    const studyTimer = window.setTimeout(() => setMemoryPhase("study"), readyMs);
    const recallTimer = window.setTimeout(() => setMemoryPhase("recall"), readyMs + studyMs);

    return () => {
      window.clearTimeout(studyTimer);
      window.clearTimeout(recallTimer);
    };
  }, [challenge]);

  const answersLocked = challenge.mode === "memory" && memoryPhase !== "recall";

  return (
    <MagneticCard>
      <div className="relative z-10 grid gap-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-3 py-1.5 text-xs font-medium text-white/72">
            <Sparkles size={14} className="text-cyan-200" />
            {challenge.category}
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/15 bg-emerald-200/[0.055] px-3 py-1.5 text-xs font-medium text-emerald-100/86">
            <Activity size={14} />
            {challenge.solvedPercent}% solved
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${challenge.id}-${memoryPhase}`}
            initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -14, filter: "blur(8px)" }}
            transition={{ duration: 0.34, ease: "easeOut" }}
            className="grid min-h-[212px] place-items-center"
          >
            <ChallengeVisual challenge={challenge} memoryPhase={memoryPhase} />
          </motion.div>
        </AnimatePresence>

        {challenge.mode === "psychology" && <p className="mx-auto max-w-xl text-center text-lg font-medium text-white/82">{challenge.prompt}</p>}

        <div className="grid answer-grid gap-3">
          {challenge.options.map((option) => {
            const active = selected === option;
            const correct = selected && option === challenge.answer;
            const wrong = active && isCorrect === false;

            return (
              <motion.button
                key={option}
                type="button"
                whileHover={{ y: selected ? 0 : -3, scale: selected ? 1 : 1.02 }}
                whileTap={{ scale: 0.97 }}
                animate={wrong ? { x: [0, -7, 7, -5, 5, 0] } : active && isCorrect ? { scale: [1, 1.06, 1] } : {}}
                transition={{ duration: wrong ? 0.34 : 0.22 }}
                onClick={() => onAnswer(option)}
                disabled={Boolean(selected) || answersLocked}
                className={classNames(
                  "group relative min-h-14 overflow-hidden rounded-2xl border px-4 py-3 text-lg font-semibold text-white transition",
                  "border-white/10 bg-white/[0.06] hover:border-cyan-200/35 hover:bg-white/[0.1]",
                  answersLocked && "cursor-default opacity-45 hover:border-white/10 hover:bg-white/[0.06]",
                  correct && "border-emerald-300/40 bg-emerald-300/14 shadow-answer-correct",
                  wrong && "border-rose-300/40 bg-rose-300/13 shadow-answer-wrong",
                )}
              >
                <span className="relative z-10 inline-flex items-center justify-center gap-2">
                  {correct && <Check size={18} className="text-emerald-200" />}
                  {wrong && <X size={18} className="text-rose-200" />}
                  {option}
                </span>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="rounded-3xl border border-white/10 bg-black/20 p-4 sm:p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className={classNames("text-sm font-semibold", isCorrect ? "text-emerald-200" : "text-rose-100")}>
                    {isCorrect ? "Pattern found" : "Close signal"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-white/72">{challenge.explanation}</p>
                  <p className="mt-2 text-sm text-cyan-100/72">
                    {isCorrect ? `Only ${challenge.solvedPercent}% solved this.` : `Most wrong answers cluster around ${challenge.commonWrong ?? "the nearest rhythm"}.`}
                  </p>
                </div>
                <motion.button
                  type="button"
                  onClick={onNext}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950"
                >
                  Next
                  <ArrowRight size={17} />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MagneticCard>
  );
}

function StatRail({ scores, streak, attempted, correct }: { scores: Scores; streak: number; attempted: number; correct: number }) {
  const total = brainScore(scores);
  const accuracy = attempted ? Math.round((correct / attempted) * 100) : 0;
  const profile = brainProfile(total);
  const items = [
    ["Pattern Recognition", scores.pattern],
    ["Memory", scores.memory],
    ["Logic", scores.logic],
    ["Observation", scores.observation],
    ["Reasoning", scores.reasoning],
  ] as const;

  return (
    <section id="statistics" className="mx-auto grid w-full max-w-6xl gap-4 px-5 py-14 lg:grid-cols-[1.05fr_1.4fr]">
      <div className="glass rounded-[26px] p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white/58">Daily Brain Score</span>
          <Brain className="text-cyan-200" size={22} />
        </div>
        <div className="mt-6 flex items-end gap-3">
          <motion.span key={total} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-7xl font-semibold tracking-normal">
            {total}
          </motion.span>
          <span className="pb-3 text-sm text-white/48">/ 100</span>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200/18 bg-orange-300/10 px-3 py-1.5 text-sm text-orange-100">
            <Flame size={15} />
            {streak}-Day Streak
          </span>
          <span className="rounded-full border border-cyan-200/18 bg-cyan-300/10 px-3 py-1.5 text-sm text-cyan-100">{profile}</span>
          <span className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1.5 text-sm text-white/70">{accuracy}% accuracy</span>
        </div>
      </div>

      <div className="glass rounded-[26px] p-6">
        <div className="mb-6 flex items-center justify-between">
          <span className="text-sm font-medium text-white/58">Cognitive Map</span>
          <LineChart className="text-emerald-200" size={21} />
        </div>
        <div className="grid gap-4">
          {items.map(([label, value]) => (
            <div key={label}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-white/76">{label}</span>
                <span className="font-semibold text-white">{value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/8">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-violet-300"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${value}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DailyChallenge({ daily }: { daily: Challenge }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-stretch">
        <div className="glass rounded-[26px] p-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-3 py-1.5 text-sm text-white/70">
            <CalendarDays size={16} className="text-violet-200" />
            Challenge of the Day
          </div>
          <h2 className="mt-5 text-3xl font-semibold tracking-normal text-white">A shared signal for every visitor.</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/58">
            Today&apos;s challenge stays fixed for global comparison while the main stream continues endlessly.
          </p>
        </div>
        <div className="rounded-[26px] border border-white/10 bg-white/[0.055] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm font-medium text-white/62">{daily.category}</span>
            <span className="rounded-full bg-emerald-300/12 px-3 py-1 text-xs text-emerald-100">{daily.solvedPercent}% solved today</span>
          </div>
          <div className="mt-6 min-h-[112px]">
            <ChallengeVisual challenge={daily} memoryPhase="study" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Leaderboard() {
  return (
    <section id="leaderboard" className="mx-auto w-full max-w-6xl px-5 py-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-cyan-100/62">Leaderboard</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-normal text-white">Signal strength</h2>
        </div>
        <Trophy className="text-amber-200" />
      </div>
      <div className="grid gap-3">
        {leaderboard.map((entry, index) => (
          <motion.div
            key={entry.name}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className={classNames(
              "flex items-center justify-between rounded-2xl border px-4 py-4",
              entry.name === "You" ? "border-cyan-200/25 bg-cyan-200/[0.08]" : "border-white/10 bg-white/[0.045]",
            )}
          >
            <div className="flex items-center gap-4">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/8 text-sm font-semibold text-white/70">{index + 1}</span>
              <div>
                <p className="font-semibold text-white">{entry.name}</p>
                <p className="text-sm text-white/46">{entry.style}</p>
              </div>
            </div>
            <span className="text-lg font-semibold text-white">{entry.score}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function BrainInsights({ scores }: { scores: Scores }) {
  const topSkill = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  const insights = [
    "Your fastest gains come from naming the rule after your first instinct, not before it.",
    "Sequences with visual rhythm tend to produce longer streaks than purely numerical traces.",
    `Your strongest current signal is ${topSkill}.`,
  ];

  return (
    <section id="insights" className="mx-auto w-full max-w-6xl px-5 py-12">
      <div className="grid gap-4 md:grid-cols-3">
        {insights.map((insight, index) => (
          <motion.article
            key={insight}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06 }}
            className="glass rounded-[24px] p-5"
          >
            <Zap className="mb-5 text-cyan-200" size={21} />
            <p className="text-sm leading-6 text-white/72">{insight}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function ChallengeArchive({ currentIndex }: { currentIndex: number }) {
  const archive = useMemo(() => generateArchive(21, Math.max(0, currentIndex - 5)), [currentIndex]);

  return (
    <section id="archive" className="mx-auto w-full max-w-6xl px-5 py-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-cyan-100/62">Challenge Archive</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-normal text-white">1,000+ generated paths</h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1.5 text-sm text-white/58">Adaptive difficulty</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {archive.map((challenge, index) => (
          <motion.article
            key={`${challenge.id}-${index}`}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (index % 6) * 0.035 }}
            className="rounded-2xl border border-white/10 bg-white/[0.045] p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-white">{challenge.category}</span>
              <span className="text-xs text-white/42">D{challenge.difficulty}</span>
            </div>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/56">{challenge.insight}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const [session, setSession] = useState<SessionState>({
    index: 0,
    streak: 7,
    correct: 0,
    attempted: 0,
    scores: initialScores,
    archive: [],
  });
  const [selected, setSelected] = useState<string>();
  const [isCorrect, setIsCorrect] = useState<boolean>();
  const [bursts, setBursts] = useState<number[]>([]);

  useEffect(() => {
    setSession(getStoredState());
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("patternmind-session", JSON.stringify(session));
    }
  }, [session]);

  const challenge = useMemo(() => generateChallenge(session.index), [session.index]);
  const daily = useMemo(() => getDailyChallenge(), []);
  const totalScore = brainScore(session.scores);
  const profile = brainProfile(totalScore);

  function answer(option: string) {
    if (selected) return;
    const correct = option === challenge.answer;
    setSelected(option);
    setIsCorrect(correct);
    setSession((current) => {
      const uplift = correct ? 3 : 1;
      const nextScores = {
        ...current.scores,
        [challenge.skill]: Math.min(99, current.scores[challenge.skill] + uplift),
      };
      return {
        ...current,
        attempted: current.attempted + 1,
        correct: current.correct + (correct ? 1 : 0),
        streak: correct ? current.streak + 1 : current.streak,
        scores: nextScores,
        archive: [challenge.id, ...current.archive].slice(0, 30),
      };
    });
    if (correct) {
      setBursts((items) => [...items, Date.now()]);
    }
  }

  function next() {
    setSelected(undefined);
    setIsCorrect(undefined);
    setSession((current) => ({ ...current, index: current.index + 1 }));
  }

  function resetSession() {
    setSelected(undefined);
    setIsCorrect(undefined);
    setSession({
      index: 0,
      streak: 7,
      correct: 0,
      attempted: 0,
      scores: initialScores,
      archive: [],
    });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06080d]">
      <FloatingParticles />

      <div className="pointer-events-none fixed inset-x-0 top-0 z-20 h-24 bg-gradient-to-b from-[#06080d] to-transparent" />

      <nav className="relative z-30 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5">
        <a href="#top" className="text-sm font-semibold tracking-[0.22em] text-white/78">
          PATTERNMIND
        </a>
        <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.055] p-1 text-sm text-white/62 backdrop-blur md:flex">
          {["statistics", "leaderboard", "insights", "archive"].map((item) => (
            <a key={item} href={`#${item}`} className="rounded-full px-3 py-1.5 capitalize transition hover:bg-white/10 hover:text-white">
              {item}
            </a>
          ))}
        </div>
        <button
          type="button"
          onClick={resetSession}
          aria-label="Reset session"
          className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.055] text-white/70 transition hover:border-white/20 hover:text-white"
        >
          <RotateCcw size={17} />
        </button>
      </nav>

      <section id="top" className="relative z-10 mx-auto grid w-full max-w-7xl place-items-center px-5 pb-8 pt-12 lg:pt-14">
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mx-auto mb-9 max-w-4xl text-center"
          >
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-3 py-1.5 text-sm text-white/66 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.9)]" />
              {categoryMix.length} cognitive modes active
            </div>
            <h1 className="text-balance text-4xl font-semibold tracking-normal text-white md:text-7xl lg:text-8xl">PATTERNMIND</h1>
            <p className="mx-auto mt-5 max-w-2xl text-balance text-xl leading-8 text-white/66 sm:text-2xl">
              Can your brain see what others miss?
            </p>
          </motion.div>

          <div className="relative">
            <AnimatePresence>
              {bursts.map((burst) => (
                <motion.div
                  key={burst}
                  className="pointer-events-none absolute left-1/2 top-1/2 z-30 h-4 w-4 rounded-full border border-emerald-200/80"
                  initial={{ opacity: 0.9, scale: 0, x: "-50%", y: "-50%" }}
                  animate={{ opacity: 0, scale: 28 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.78, ease: "easeOut" }}
                  onAnimationComplete={() => setBursts((items) => items.filter((item) => item !== burst))}
                />
              ))}
            </AnimatePresence>
            <ChallengeCard challenge={challenge} selected={selected} isCorrect={isCorrect} onAnswer={answer} onNext={next} />
          </div>

          <div className="mx-auto mt-7 grid max-w-3xl grid-cols-1 gap-3 text-center sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-4 backdrop-blur">
              <p className="text-2xl font-semibold text-white">{totalScore}</p>
              <p className="mt-1 text-xs text-white/44">Brain Score</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-4 backdrop-blur">
              <p className="text-2xl font-semibold text-white">{session.streak}</p>
              <p className="mt-1 text-xs text-white/44">Day Streak</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-4 backdrop-blur">
              <p className="text-2xl font-semibold text-white">{profile}</p>
              <p className="mt-1 text-xs text-white/44">Profile</p>
            </div>
          </div>
        </div>
      </section>

      <DailyChallenge daily={daily} />
      <StatRail scores={session.scores} streak={session.streak} attempted={session.attempted} correct={session.correct} />
      <Leaderboard />
      <BrainInsights scores={session.scores} />
      <ChallengeArchive currentIndex={session.index} />

      <footer className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-4 border-t border-white/10 px-5 py-10 text-sm text-white/46 sm:flex-row sm:items-center sm:justify-between">
        <span>PatternMind</span>
        <a href="#top" className="inline-flex items-center gap-2 text-white/64 transition hover:text-white">
          Return to challenge
          <ChevronRight size={16} />
        </a>
      </footer>
    </main>
  );
}
