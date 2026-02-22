import { Topic, Question } from "@/types";
import percentagesData from './percentages_complete.json';
import profitLossData from './profit_loss.json';
import timeWorkData from './time_work.json';
import tsdData from './tsd.json';
import siCiData from './si_ci.json';
import ratioData from './ratio_proportion.json';
import averagesData from './averages.json';
import numberData from './number_system.json';
import probData from './probability.json';
import permCombData from './permutations_combinations.json';
import mixturesData from './mixtures.json';
import pipesData from './pipes_cisterns.json';

import logicalData from './logical_reasoning.json';
import verbalData from './verbal_reasoning.json';
import nonVerbalData from './non_verbal_reasoning.json';
import bloodData from './blood_relations.json';
import seatingData from './seating_arrangement.json';
import codingData from './coding_decoding.json';
import directionData from './direction_sense.json';
import syllogismsData from './syllogisms.json';
import puzzlesData from './puzzles.json';
import dataSuffData from './data_sufficiency.json';
import analogyData from './analogy_series.json';

// Helper to transform JSON data into Topic structure
const createTopicFromJSON = (id: string, icon: string, data: any, description: string): Topic => {
  return {
    id,
    name: data.topic,
    category: data.category.toLowerCase(),
    icon,
    description,
    lessons: [
      {
        id: `${id}-lesson`,
        title: `Complete Guide to ${data.topic}`,
        content: data.sections.map((s: any) =>
          `## ${s.questionType}\n\n**Concept:** ${s.concept}\n\n**Formula:** ${s.formula}\n\n**Technique:** ${s.solvingTechnique}`
        ).join("\n\n---\n\n"),
        examples: data.examples
          ? data.examples.map((ex: any) => ({
            problem: `${ex.difficulty}: ${ex.question}`,
            solution: ex.solution,
            explanation: ex.explanation || "See detailed solution steps."
          }))
          : data.sections.flatMap((s: any) =>
            (s.examples || []).map((ex: any) => ({
              problem: `${ex.difficulty}: ${ex.question}`,
              solution: ex.solution,
              explanation: ex.explanation || "See detailed solution steps above."
            }))
          ),
        tips: [
          ...(data.shortcuts || []).map((s: string) => `Shortcut: ${s}`),
          ...(data.commonMistakes || []).map((m: string) => `Mistake: ${m}`),
          ...(data.placementTips || []).map((t: string) => `Placement Tip: ${t}`)
        ]
      }
    ]
  };
};

export const aptitudeTopics: Topic[] = [
  createTopicFromJSON("percentages", "📊", percentagesData, "Master percentage calculations, formulas, and techniques."),
  createTopicFromJSON("profit-loss", "💰", profitLossData, "Learn to calculate profit, loss, and discount problems."),
  createTopicFromJSON("si-ci", "🏦", siCiData, "Understand simple and compound interest calculations."),
  createTopicFromJSON("time-work", "⏱️", timeWorkData, "Solve problems involving work efficiency and time."),
  createTopicFromJSON("time-speed-distance", "🚀", tsdData, "Master relative speed, trains, and boats problems."),
  createTopicFromJSON("ratio-proportion", "⚖️", ratioData, "Learn to compare quantities and divide in ratios."),
  createTopicFromJSON("averages", "📈", averagesData, "Calculate means and weighted averages easily."),
  createTopicFromJSON("number-system", "#️⃣", numberData, "Master divisibility rules, unit digits, and remainders."),
  createTopicFromJSON("probability", "🎲", probData, "Understand chance, coins, dice, and card problems."),
  createTopicFromJSON("permutations-combinations", "🔢", permCombData, "Learn counting, arrangements, and selections."),
  createTopicFromJSON("mixtures-allegations", "🧪", mixturesData, "Solve mixture problems using allegation method."),
  createTopicFromJSON("pipes-cisterns", "🚰", pipesData, "Solve inlet-outlet pipe problems efficiently.")
];

export const reasoningTopics: Topic[] = [
  createTopicFromJSON("logical-reasoning", "🧠", logicalData, "Develop critical thinking with statements and conclusions."),
  createTopicFromJSON("verbal-reasoning", "🗣️", verbalData, "Enhance verbal ability with analogies and classification."),
  createTopicFromJSON("non-verbal-reasoning", "🖼️", nonVerbalData, "Solve visual puzzles, series, and mirror images."),
  createTopicFromJSON("blood-relations", "👨‍👩‍👧‍👦", bloodData, "Master family tree and relationship mapping."),
  createTopicFromJSON("seating-arrangement", "🪑", seatingData, "Solve linear and circular seating arrangement puzzles."),
  createTopicFromJSON("coding-decoding", "🔐", codingData, "Decipher patterns in letter and number coding."),
  createTopicFromJSON("direction-sense", "🧭", directionData, "Navigate North-South-East-West problems easily."),
  createTopicFromJSON("syllogisms", "🤔", syllogismsData, "Draw logical conclusions from premises using Venn diagrams."),
  createTopicFromJSON("puzzles", "🧩", puzzlesData, "Crack complex scheduling and floor-based puzzles."),
  createTopicFromJSON("data-sufficiency", "ℹ️", dataSuffData, "Determine if given data is sufficient to answer."),
  createTopicFromJSON("analogy-series", "🔗", analogyData, "Find patterns in number and letter series.")
];

export const allTopics = [...aptitudeTopics, ...reasoningTopics];

// Keeping existing sample questions for backward compatibility with Test Mode
export const sampleQuestions: Record<string, Question[]> = {
  "percentages": [
    {
      id: "p1",
      question: "What is 15% of 200?",
      options: ["25", "30", "35", "40"],
      correctAnswer: 1,
      explanation: "15% of 200 = (15/100) * 200 = 30",
      difficulty: "easy",
      topic: "percentages"
    },
    {
      id: "p2",
      question: "A number increased by 20% gives 60. What is the number?",
      options: ["45", "48", "50", "52"],
      correctAnswer: 2,
      explanation: "1.2x = 60 => x = 50",
      difficulty: "medium",
      topic: "percentages"
    }
  ],
  "profit-loss": [
    {
      id: "pl1",
      question: "CP = 100, SP = 120. Profit %?",
      options: ["10%", "20%", "25%", "30%"],
      correctAnswer: 1,
      explanation: "Profit = 20. % = 20/100 = 20%.",
      difficulty: "easy",
      topic: "profit-loss"
    }
  ],
  "time-work": [
    {
      id: "tw1",
      question: "A does work in 10 days. 1 day work?",
      options: ["1/5", "1/10", "10", "1"],
      correctAnswer: 1,
      explanation: "1/10",
      difficulty: "easy",
      topic: "time-work"
    }
  ]
};
