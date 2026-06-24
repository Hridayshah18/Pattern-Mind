export type Skill = "pattern" | "memory" | "logic" | "observation" | "reasoning";

export type Challenge = {
  id: string;
  category: string;
  title: string;
  mode: "sequence" | "hidden" | "odd" | "memory" | "psychology" | "matrix" | "text";
  difficulty: number;
  sequence?: string[];
  prompt?: string;
  examples?: { label: string; mark: string }[];
  visualGrid?: string[];
  memoryGrid?: string[];
  memoryQuestion?: string;
  options: string[];
  answer: string;
  explanation: string;
  insight: string;
  solvedPercent: number;
  commonWrong?: string;
  skill: Skill;
};

const yes = "\u2713";
const no = "\u2715";
const colors = ["\uD83D\uDD34", "\uD83D\uDFE2", "\uD83D\uDD35", "\uD83D\uDFE1", "\uD83D\uDFE3", "\uD83D\uDFE0", "\u26AA", "\u26AB"];
const shapes = ["\u25A0", "\u25B2", "\u25CF", "\u25C6", "\u2B1F", "\u2726", "\u2B22", "\u25B0"];
const symbols = ["\u03B1", "\u03B2", "\u03B3", "\u03B4", "\u03A9", "\u03BB", "\u03C0", "\u03A3"];
const fruit = ["APPLE", "BANANA", "MANGO", "PEACH", "GRAPE", "ORANGE"];
const objects = ["TABLE", "CHAIR", "LAMP", "SOFA", "CLOCK", "SHELF"];
const animals = ["DOG", "CAT", "HORSE", "RAVEN", "WHALE", "TIGER"];

export const categoryMix = [
  "Color Logic",
  "Shape Logic",
  "Symbol Logic",
  "Sequence Logic",
  "Matrix Reasoning",
  "Hidden Rule",
  "Visual Perception",
  "Memory",
  "Analogy Reasoning",
  "Social Prediction",
];

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(items: T[], random: () => number) {
  return items[Math.floor(random() * items.length)];
}

function shuffle<T>(items: T[], random: () => number) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function solvedFrom(seed: number, difficulty: number) {
  const base = 76 - difficulty * 7;
  return Math.max(8, Math.min(88, Math.round(base + (seed % 19) - 9)));
}

function uniqueOptions(answer: string, pool: string[], random: () => number, count = 4) {
  const options = new Set([answer]);
  const shuffled = shuffle(pool.filter((item) => item !== answer), random);
  for (const item of shuffled) {
    if (options.size >= count) break;
    options.add(item);
  }
  return shuffle([...options], random);
}

function colorChallenge(seed: number, random: () => number, difficulty: number): Challenge {
  const [a, b, c, d] = shuffle(colors, random).slice(0, 4);
  const family = seed % 8;
  const sequence =
    family === 0
      ? [a, b, a, b, a, "?"]
      : family === 1
        ? [a, a, b, a, a, "?"]
        : family === 2
          ? [a, b, c, a, b, "?"]
          : family === 3
            ? [a, b, b, c, c, c, "?"]
            : family === 4
              ? [a, b, c, b, a, "?"]
              : family === 5
                ? [a, a, b, b, c, c, "?"]
                : family === 6
                  ? [a, b, c, d, a, b, "?"]
                  : [a, b, a, c, a, d, "?"];
  const answer = family === 0 ? b : family === 1 ? b : family === 2 ? c : family === 3 ? a : family === 4 ? b : family === 5 ? a : family === 6 ? c : a;

  return {
    id: `color-${seed}`,
    category: "Color Logic",
    title: "Color rhythm",
    mode: "sequence",
    difficulty,
    sequence,
    options: uniqueOptions(answer, colors, random),
    answer,
    explanation:
      family === 3
        ? "The run length grows: one color, then two, then three."
        : family === 4
          ? "The sequence mirrors back toward the center."
          : family === 5
            ? "Each color appears as a pair before the next pair starts."
            : family === 6
              ? "A four-color cycle has started again."
              : family === 7
                ? "The anchor color returns between every new color."
                : "The colors follow a repeating rhythm.",
    insight: "Color puzzles stay fresh when the rule can be rhythm, symmetry, grouping, or anchoring.",
    solvedPercent: solvedFrom(seed, difficulty),
    commonWrong: a,
    skill: "pattern",
  };
}

function shapeChallenge(seed: number, random: () => number, difficulty: number): Challenge {
  const [a, b, c, d] = shuffle(shapes, random).slice(0, 4);
  const family = seed % 8;
  const sequence =
    family === 0
      ? [a, b, a, b, a, "?"]
      : family === 1
        ? [a, b, b, a, b, "?"]
        : family === 2
          ? [a, a, b, c, c, "?"]
          : family === 3
            ? [a, b, c, b, a, "?"]
            : family === 4
              ? [a, b, c, a, b, "?"]
              : family === 5
                ? [a, a, b, b, c, c, "?"]
                : family === 6
                  ? [a, b, c, d, c, b, "?"]
                  : [a, b, a, c, a, d, "?"];
  const answer = family === 2 ? b : family === 4 ? c : family === 6 ? a : family === 7 ? a : b;

  return {
    id: `shape-${seed}`,
    category: "Shape Logic",
    title: "Shape cadence",
    mode: "sequence",
    difficulty,
    sequence,
    options: uniqueOptions(answer, shapes, random),
    answer,
    explanation:
      family === 3
        ? "The sequence mirrors back through the center shape."
        : family === 5
          ? "Every shape appears twice before moving on."
          : family === 6
            ? "The sequence moves outward, then back inward symmetrically."
            : family === 7
              ? "One anchor shape appears between changing shapes."
              : "The shape positions repeat as a compact visual cadence.",
    insight: "Shape puzzles reward spatial grouping more than verbal logic.",
    solvedPercent: solvedFrom(seed, difficulty),
    commonWrong: c,
    skill: "pattern",
  };
}

function symbolChallenge(seed: number, random: () => number, difficulty: number): Challenge {
  const [a, b, c, d] = shuffle(symbols, random).slice(0, 4);
  const family = seed % 7;
  const sequence =
    family === 0
      ? [a, b, c, a, b, "?"]
      : family === 1
        ? [a, b, a, c, a, "?"]
        : family === 2
          ? [a, a, b, a, a, "?"]
          : family === 3
            ? [a, b, c, d, a, "?"]
            : family === 4
              ? [a, b, c, b, a, "?"]
              : family === 5
                ? [a, b, b, c, c, c, "?"]
                : [a, b, a, b, c, "?"];
  const answer = family === 0 ? c : family === 1 ? d : family === 2 ? b : family === 3 ? b : family === 4 ? b : family === 5 ? d : c;

  return {
    id: `symbol-${seed}`,
    category: "Symbol Logic",
    title: "Symbol grammar",
    mode: "sequence",
    difficulty,
    sequence,
    options: uniqueOptions(answer, symbols, random),
    answer,
    explanation:
      family === 1
        ? "The first symbol anchors the sequence between changing symbols."
        : family === 4
          ? "The symbols mirror back through the center."
          : family === 5
            ? "The run length increases by one each time."
            : "The symbol order follows a repeating grammar.",
    insight: "Abstract symbols make the brain solve structure without semantic shortcuts.",
    solvedPercent: solvedFrom(seed, difficulty),
    commonWrong: b,
    skill: "pattern",
  };
}

function sequenceChallenge(seed: number, random: () => number, difficulty: number): Challenge {
  const type = seed % 10;
  let sequence: string[] = [];
  let answer = "";
  let explanation = "";

  if (type === 0) {
    const start = 2 + Math.floor(random() * 5);
    const step = 2 + Math.floor(random() * 5);
    sequence = [0, 1, 2, 3, 4].map((i) => String(start + i * step));
    answer = String(start + 5 * step);
    explanation = `Each number increases by ${step}.`;
  } else if (type === 1) {
    const start = 2 + Math.floor(random() * 3);
    sequence = [0, 1, 2, 3, 4].map((i) => String(start * 2 ** i));
    answer = String(start * 2 ** 5);
    explanation = "Each number doubles.";
  } else if (type === 2) {
    const offset = Math.floor(random() * 3);
    sequence = [1, 4, 9, 16, 25].map((n) => String(n + offset));
    answer = String(36 + offset);
    explanation = "The values follow square numbers with the same offset.";
  } else if (type === 3) {
    const a = 1 + Math.floor(random() * 4);
    const b = a + 1 + Math.floor(random() * 3);
    const vals = [a, b];
    while (vals.length < 6) vals.push(vals.at(-1)! + vals.at(-2)!);
    sequence = vals.slice(0, 5).map(String);
    answer = String(vals[5]);
    explanation = "Each value is the sum of the two before it.";
  } else if (type === 4) {
    const start = 3 + Math.floor(random() * 5);
    sequence = [start, start + 2, start + 6, start + 12, start + 20].map(String);
    answer = String(start + 30);
    explanation = "The gaps increase by 2 each step.";
  } else if (type === 5) {
    const start = 1 + Math.floor(random() * 5);
    sequence = [start, start + 1, start + 3, start + 6, start + 10].map(String);
    answer = String(start + 15);
    explanation = "The gaps grow by 1 each time.";
  } else if (type === 6) {
    const start = 2 + Math.floor(random() * 4);
    sequence = [start, start * 3, start * 3 + 2, (start * 3 + 2) * 3, (start * 3 + 2) * 3 + 2].map(String);
    answer = String(((start * 3 + 2) * 3 + 2) * 3);
    explanation = "The operations alternate: multiply by 3, then add 2.";
  } else if (type === 7) {
    const start = 20 + Math.floor(random() * 9);
    sequence = [start, start - 2, start - 5, start - 9, start - 14].map(String);
    answer = String(start - 20);
    explanation = "The sequence descends with gaps that increase by 1.";
  } else if (type === 8) {
    const start = 2 + Math.floor(random() * 4);
    sequence = [start, start + 3, start * 2, start * 2 + 3, start * 4].map(String);
    answer = String(start * 4 + 3);
    explanation = "Two interleaved sequences alternate: one doubles, the other stays three ahead.";
  } else {
    const start = 1 + Math.floor(random() * 4);
    sequence = [start, start + 2, start + 6, start + 14, start + 30].map(String);
    answer = String(start + 62);
    explanation = "Each gap doubles from the previous gap.";
  }

  const numericPool = [
    Number(answer) + 2,
    Number(answer) - 2,
    Number(answer) + 4,
    Math.max(1, Number(answer) / 2),
    Number(answer) + 8,
  ].map((n) => String(Math.round(n)));

  return {
    id: `sequence-${seed}`,
    category: "Sequence Logic",
    title: "Number trace",
    mode: "sequence",
    difficulty,
    sequence: [...sequence, "?"],
    options: uniqueOptions(answer, numericPool, random),
    answer,
    explanation,
    insight: "Numerical patterns become harder to memorize when operations alternate.",
    solvedPercent: solvedFrom(seed, difficulty),
    commonWrong: numericPool[0],
    skill: "logic",
  };
}

function matrixChallenge(seed: number, random: () => number, difficulty: number): Challenge {
  const [a, b, c, d, e] = shuffle([...shapes, ...symbols], random).slice(0, 5);
  const family = seed % 6;
  const grid =
    family === 0
      ? [a, b, a, b, a, b, a, b, "?"]
      : family === 1
        ? [a, a, b, a, a, b, a, a, "?"]
        : family === 2
          ? [a, b, c, b, c, a, c, a, "?"]
          : family === 3
            ? [a, b, c, a, b, c, a, b, "?"]
            : family === 4
              ? [a, b, a, c, d, c, a, b, "?"]
              : [a, b, c, d, a, b, c, d, "?"];
  const answer = family === 0 ? a : family === 1 ? b : family === 2 ? b : family === 3 ? c : family === 4 ? a : a;

  return {
    id: `matrix-${seed}`,
    category: "Matrix Reasoning",
    title: "Nine-cell rule",
    mode: "matrix",
    difficulty,
    visualGrid: grid,
    options: uniqueOptions(answer, [...shapes, ...symbols], random),
    answer,
    explanation:
      family === 2
        ? "Each row shifts the same three symbols one step to the left."
        : family === 4
          ? "The corners match, and the side cells mirror each other."
          : "Rows and columns together reveal the missing cell.",
    insight: "Matrix puzzles invite several possible rules before one clicks.",
    solvedPercent: solvedFrom(seed, difficulty + 1),
    commonWrong: b,
    skill: "reasoning",
  };
}

function hiddenRuleChallenge(seed: number, random: () => number, difficulty: number): Challenge {
  const rules = [
    {
      yes: fruit,
      no: objects,
      test: animals,
      answerFor: () => no,
      explanation: "The check mark belongs to fruit, not objects or animals.",
    },
    {
      yes: ["BANANA", "TABLE", "RAVEN", "GRAPE"],
      no: ["DOG", "CLOCK", "MINT", "CLOUD"],
      test: ["CHAIR", "STONE", "PLANE", "WHALE"],
      answerFor: (word: string) => (word.includes("A") ? yes : no),
      explanation: "The accepted words contain the letter A.",
    },
    {
      yes: ["APPLE", "CHAIR", "TABLE", "WHALE"],
      no: ["BANANA", "DOG", "CLOCKS", "ORANGE"],
      test: ["GRAPE", "LAMP", "TIGER", "SOFA"],
      answerFor: (word: string) => (word.length === 5 ? yes : no),
      explanation: "The accepted words have exactly five letters.",
    },
    {
      yes: ["TABLE", "DOG", "CHAIR", "RAVEN"],
      no: ["APPLE", "ORANGE", "EAGLE", "IDEA"],
      test: ["BANANA", "OWL", "MANGO", "AXIS"],
      answerFor: (word: string) => ("AEIOU".includes(word[0]) ? no : yes),
      explanation: "The accepted words start with a consonant.",
    },
    {
      yes: ["SHEEP", "MOON", "BOOK", "BELL"],
      no: ["DOG", "CHAIR", "PLANE", "RIVER"],
      test: ["APPLE", "TABLE", "GREEN", "STONE"],
      answerFor: (word: string) => (/([A-Z])\1/.test(word) ? yes : no),
      explanation: "The accepted words contain a repeated adjacent letter.",
    },
    {
      yes: ["APPLE", "BANANA", "CHAIR", "DOG"],
      no: ["TABLE", "WHALE", "RAVEN", "SHELF"],
      test: ["CLOCK", "ZEBRA", "MANGO", "LAMP"],
      answerFor: (word: string) => (word[0] <= "D" ? yes : no),
      explanation: "The accepted words begin with A through D.",
    },
    {
      yes: ["BANANA", "ORANGE", "TABLE", "RAVEN"],
      no: ["DOG", "CHAIR", "CLOCK", "SHELF"],
      test: ["APPLE", "SOFA", "TIGER", "LAMP"],
      answerFor: (word: string) => (["APPLE", "SOFA", "TIGER"].includes(word) ? yes : no),
      explanation: "The accepted words feel like two spoken beats.",
    },
    {
      yes: ["DOG", "MOON", "CLOCK", "BOOK"],
      no: ["TABLE", "CHAIR", "MINT", "RIVER"],
      test: ["SOFA", "APPLE", "WHALE", "CLOUD"],
      answerFor: (word: string) => (/[ABDOPQR]/.test(word) ? yes : no),
      explanation: "The accepted words contain a letter with an enclosed shape.",
    },
  ];
  const rule = pick(rules, random);
  const examples = [
    ...shuffle(rule.yes, random)
      .slice(0, 2)
      .map((label) => ({ label, mark: yes })),
    ...shuffle(rule.no, random)
      .slice(0, 2)
      .map((label) => ({ label, mark: no })),
  ];
  const test = pick(rule.test, random);
  const answer = rule.answerFor(test);

  return {
    id: `hidden-${seed}`,
    category: "Hidden Rule",
    title: "Silent rule",
    mode: "hidden",
    difficulty,
    prompt: `${test} ?`,
    examples: shuffle(examples, random),
    options: [yes, no],
    answer,
    explanation: rule.explanation,
    insight: "Hidden-rule puzzles expose whether you test categories, letters, sound, or shape first.",
    solvedPercent: solvedFrom(seed, difficulty + 1),
    commonWrong: answer === yes ? no : yes,
    skill: "reasoning",
  };
}

function oddObjectChallenge(seed: number, random: () => number, difficulty: number): Challenge {
  const pool = seed % 2 === 0 ? [...colors, ...shapes] : [...symbols, ...shapes];
  const [base, odd, distractor] = shuffle(pool, random).slice(0, 3);
  const oddIndex = Math.floor(random() * 9);
  const family = seed % 4;
  const grid = Array.from({ length: 9 }, (_, index) => {
    if (index === oddIndex) return odd;
    if (family === 2 && [1, 3, 5, 7].includes(index)) return distractor;
    if (family === 3 && index % 3 === 1) return distractor;
    return base;
  });
  const answer = String(oddIndex + 1);

  return {
    id: `odd-${seed}`,
    category: "Visual Perception",
    title: "Odd signal",
    mode: "odd",
    difficulty,
    prompt: "Find the odd object",
    visualGrid: grid,
    options: Array.from({ length: 9 }, (_, index) => String(index + 1)),
    answer,
    explanation: `Position ${answer} is the cell that breaks the visual set.`,
    insight: "Observation improves when your eyes scan the whole field before choosing.",
    solvedPercent: solvedFrom(seed, difficulty),
    commonWrong: String(((oddIndex + 1) % 9) + 1),
    skill: "observation",
  };
}

function memoryChallenge(seed: number, random: () => number, difficulty: number): Challenge {
  const pool = shuffle([...colors, ...shapes], random);
  const grid = pool.slice(0, difficulty > 5 ? 8 : 6);
  const targetIndex = Math.floor(random() * grid.length);
  const family = seed % 4;
  const colorCount = grid.filter((item) => colors.includes(item)).length;
  const answer =
    family === 0
      ? grid[targetIndex]
      : family === 1
        ? grid[0]
        : family === 2
          ? grid.at(-1)!
          : colorCount > grid.length / 2
            ? "Colors"
            : "Shapes";
  const memoryQuestion =
    family === 0
      ? `What appeared in slot ${targetIndex + 1}?`
      : family === 1
        ? "What appeared first?"
        : family === 2
          ? "What appeared last?"
          : "What appeared more often?";
  const optionPool = family === 3 ? ["Colors", "Shapes"] : pool.slice(grid.length);

  return {
    id: `memory-${seed}`,
    category: "Memory",
    title: "Working trace",
    mode: "memory",
    difficulty,
    memoryGrid: grid,
    memoryQuestion,
    options: uniqueOptions(answer, optionPool, random, family === 3 ? 2 : 4),
    answer,
    explanation:
      family === 0
        ? `Slot ${targetIndex + 1} held ${answer}.`
        : family === 1
          ? `The first slot held ${answer}.`
          : family === 2
            ? `The final slot held ${answer}.`
            : `${answer} appeared more often in the pattern.`,
    insight: "Memory stays engaging when the recall target changes from slot to order to category.",
    solvedPercent: solvedFrom(seed, difficulty + 1),
    commonWrong: grid[(targetIndex + 1) % grid.length],
    skill: "memory",
  };
}

function analogyChallenge(seed: number, random: () => number, difficulty: number): Challenge {
  const families = [
    {
      prompt: "Hot is to cold as up is to ?",
      answer: "down",
      options: ["down", "left", "high", "open"],
      explanation: "Both pairs are opposites.",
    },
    {
      prompt: "Seed is to tree as idea is to ?",
      answer: "plan",
      options: ["plan", "noise", "paper", "clock"],
      explanation: "The second item is what the first can grow into.",
    },
    {
      prompt: "Circle is to sphere as square is to ?",
      answer: "cube",
      options: ["cube", "line", "angle", "grid"],
      explanation: "The relationship moves from a 2D form to its 3D counterpart.",
    },
    {
      prompt: "Question is to answer as signal is to ?",
      answer: "response",
      options: ["response", "silence", "number", "memory"],
      explanation: "The second item is the natural reply to the first.",
    },
    {
      prompt: "Map is to territory as model is to ?",
      answer: "system",
      options: ["system", "window", "color", "habit"],
      explanation: "A model represents a system the way a map represents territory.",
    },
    {
      prompt: "Fast is to faster as precise is to ?",
      answer: "more precise",
      options: ["more precise", "precision", "slow", "least precise"],
      explanation: "The relationship changes an adjective into its comparative form.",
    },
  ];
  const selected = pick(families, random);

  return {
    id: `analogy-${seed}`,
    category: "Analogy Reasoning",
    title: "Relational logic",
    mode: "text",
    difficulty,
    prompt: selected.prompt,
    options: shuffle(selected.options, random),
    answer: selected.answer,
    explanation: selected.explanation,
    insight: "Analogy challenges keep engagement high because the rule is conceptual, not visual.",
    solvedPercent: solvedFrom(seed, difficulty + 1),
    commonWrong: selected.options.find((item) => item !== selected.answer),
    skill: "reasoning",
  };
}

function psychologyChallenge(seed: number, random: () => number, difficulty: number): Challenge {
  const prompts = [
    {
      prompt: "Most people choose the color that feels fastest.",
      options: [colors[0], colors[2], colors[1], colors[4]],
      answer: colors[0],
      explanation: "Red is commonly associated with speed, urgency, and action.",
    },
    {
      prompt: "Most people pick the shape that feels most stable.",
      options: [shapes[1], shapes[2], shapes[0], shapes[3]],
      answer: shapes[0],
      explanation: "Squares tend to feel stable because their base and sides imply structure.",
    },
    {
      prompt: "Most people choose the option that feels least risky.",
      options: ["A", "B", "C", "D"],
      answer: "B",
      explanation: "Middle-left choices often feel balanced without seeming like the default center.",
    },
    {
      prompt: "Most people notice the symbol with the strongest interruption.",
      options: [symbols[0], symbols[1], symbols[4], symbols[5]],
      answer: symbols[4],
      explanation: "The larger enclosed form tends to attract attention faster in a small set.",
    },
    {
      prompt: "Most people choose the option that feels most complete.",
      options: ["\u25D0", "\u25CF", "\u25CB", "\u25D2"],
      answer: "\u25CF",
      explanation: "Filled forms often feel more complete and resolved than partial forms.",
    },
    {
      prompt: "Most people pick the item that feels calmest.",
      options: ["Red", "Blue", "Yellow", "Orange"],
      answer: "Blue",
      explanation: "Blue is frequently associated with calm, distance, and stability.",
    },
    {
      prompt: "Most people choose the number that feels most balanced.",
      options: ["1", "3", "7", "9"],
      answer: "7",
      explanation: "Seven often feels balanced because it is familiar, odd, and cognitively salient.",
    },
  ];
  const selected = pick(prompts, random);

  return {
    id: `psychology-${seed}`,
    category: "Social Prediction",
    title: "Crowd instinct",
    mode: "psychology",
    difficulty,
    prompt: selected.prompt,
    options: shuffle(selected.options, random),
    answer: selected.answer,
    explanation: selected.explanation,
    insight: "Social prediction asks you to model perception rather than solve a fixed equation.",
    solvedPercent: solvedFrom(seed, difficulty),
    commonWrong: selected.options.find((item) => item !== selected.answer),
    skill: "reasoning",
  };
}

export function generateChallenge(index: number, modifier = "standard"): Challenge {
  const seed = hashSeed(`${modifier}-${index}`);
  const random = rng(seed);
  const difficulty = Math.min(10, 1 + Math.floor(index / 10) + Math.floor(random() * 3));
  const type = index % categoryMix.length;

  if (type === 0) return colorChallenge(seed, random, difficulty);
  if (type === 1) return shapeChallenge(seed, random, difficulty);
  if (type === 2) return symbolChallenge(seed, random, difficulty);
  if (type === 3) return sequenceChallenge(seed, random, difficulty);
  if (type === 4) return matrixChallenge(seed, random, difficulty);
  if (type === 5) return hiddenRuleChallenge(seed, random, difficulty);
  if (type === 6) return oddObjectChallenge(seed, random, difficulty);
  if (type === 7) return memoryChallenge(seed, random, difficulty);
  if (type === 8) return analogyChallenge(seed, random, difficulty);
  return psychologyChallenge(seed, random, difficulty);
}

export function generateArchive(count = 18, offset = 0) {
  return Array.from({ length: count }, (_, index) => generateChallenge(index + offset));
}

export function getDailyChallenge(date = new Date()) {
  const key = date.toISOString().slice(0, 10);
  const daySeed = hashSeed(`daily-${key}`) % 10000;
  return generateChallenge(daySeed, key);
}
