import { Topic, Question } from "@/types";

export const aptitudeTopics: Topic[] = [
  {
    id: "percentages",
    name: "Percentages",
    category: "aptitude",
    icon: "📊",
    description: "Master percentage calculations for profit, loss, and more",
    lessons: [
      {
        id: "percent-basics",
        title: "Understanding Percentages",
        content: `A percentage is a way of expressing a number as a fraction of 100. The word "percent" means "per hundred."

**Key Formula:**
Percentage = (Part / Whole) × 100

**Converting Percentages:**
- To convert percentage to decimal: Divide by 100 (e.g., 25% = 0.25)
- To convert decimal to percentage: Multiply by 100 (e.g., 0.75 = 75%)`,
        examples: [
          {
            problem: "What is 20% of 150?",
            solution: "20% of 150 = (20/100) × 150 = 30",
            explanation: "Simply multiply the percentage (as a decimal) by the number."
          },
          {
            problem: "Express 45 as a percentage of 180.",
            solution: "(45/180) × 100 = 25%",
            explanation: "Divide the part by the whole, then multiply by 100."
          }
        ],
        tips: [
          "To find 10%, just divide by 10",
          "50% is always half the number",
          "25% = one-quarter, 75% = three-quarters",
          "Percentage increase = (New - Old)/Old × 100"
        ]
      }
    ]
  },
  {
    id: "profit-loss",
    name: "Profit & Loss",
    category: "aptitude",
    icon: "💰",
    description: "Learn to calculate profit, loss, and discount problems",
    lessons: [
      {
        id: "pl-basics",
        title: "Profit & Loss Fundamentals",
        content: `**Key Terms:**
- **Cost Price (CP):** The price at which an item is bought
- **Selling Price (SP):** The price at which an item is sold
- **Profit:** When SP > CP, Profit = SP - CP
- **Loss:** When CP > SP, Loss = CP - SP

**Important Formulas:**
- Profit % = (Profit / CP) × 100
- Loss % = (Loss / CP) × 100
- SP = CP × (1 + Profit%/100) or CP × (1 - Loss%/100)`,
        examples: [
          {
            problem: "A book bought for ₹200 is sold for ₹250. Find the profit percentage.",
            solution: "Profit = 250 - 200 = ₹50. Profit% = (50/200) × 100 = 25%",
            explanation: "First calculate profit, then find what percentage it is of the cost price."
          }
        ],
        tips: [
          "Always calculate profit/loss percentage on Cost Price",
          "Successive discounts are not additive",
          "Marked Price × (1 - Discount%) = Selling Price"
        ]
      }
    ]
  },
  {
    id: "time-work",
    name: "Time & Work",
    category: "aptitude",
    icon: "⏱️",
    description: "Solve problems involving work completion and efficiency",
    lessons: [
      {
        id: "tw-basics",
        title: "Time & Work Basics",
        content: `**Core Concept:**
If a person can complete a work in 'n' days, their 1-day work = 1/n

**Key Formulas:**
- Combined work: 1/A + 1/B (when A and B work together)
- Total work = Rate × Time
- If A is twice as efficient as B, A takes half the time of B`,
        examples: [
          {
            problem: "A can do a work in 10 days, B can do it in 15 days. How long will they take together?",
            solution: "Combined rate = 1/10 + 1/15 = 5/30 = 1/6. Time = 6 days",
            explanation: "Add individual rates to get combined rate, then find total time."
          }
        ],
        tips: [
          "Always convert days to fractions representing 1-day work",
          "LCM method works great for comparison",
          "Efficiency is inversely proportional to time"
        ]
      }
    ]
  },
  {
    id: "time-speed-distance",
    name: "Time, Speed & Distance",
    category: "aptitude",
    icon: "🚗",
    description: "Master problems involving motion and travel",
    lessons: [
      {
        id: "tsd-basics",
        title: "Speed, Distance & Time",
        content: `**Fundamental Formula:**
Speed = Distance / Time

**Unit Conversions:**
- km/hr to m/s: Multiply by 5/18
- m/s to km/hr: Multiply by 18/5

**Average Speed:**
For equal distances: Average Speed = 2ab/(a+b) where a and b are speeds`,
        examples: [
          {
            problem: "A car travels 180 km in 3 hours. Find its speed.",
            solution: "Speed = 180/3 = 60 km/hr",
            explanation: "Simply divide distance by time."
          }
        ],
        tips: [
          "Average speed ≠ average of speeds (common mistake!)",
          "Relative speed for same direction: subtract speeds",
          "Relative speed for opposite direction: add speeds"
        ]
      }
    ]
  },
  {
    id: "probability",
    name: "Probability",
    category: "aptitude",
    icon: "🎲",
    description: "Understand chance and likelihood calculations",
    lessons: [
      {
        id: "prob-basics",
        title: "Probability Fundamentals",
        content: `**Definition:**
Probability = Number of favorable outcomes / Total number of outcomes

**Range:** 0 ≤ P ≤ 1
- P = 0: Impossible event
- P = 1: Certain event

**Key Rules:**
- P(A or B) = P(A) + P(B) - P(A and B)
- P(A and B) = P(A) × P(B) for independent events`,
        examples: [
          {
            problem: "What is the probability of getting a head when a coin is tossed?",
            solution: "P(Head) = 1/2 = 0.5 = 50%",
            explanation: "One favorable outcome (head) out of two possible outcomes (head or tail)."
          }
        ],
        tips: [
          "Always identify total outcomes first",
          "Complement: P(not A) = 1 - P(A)",
          "For 'or' problems, check if events are mutually exclusive"
        ]
      }
    ]
  },
  {
    id: "permutations-combinations",
    name: "Permutations & Combinations",
    category: "aptitude",
    icon: "🔢",
    description: "Learn counting principles and arrangements",
    lessons: [
      {
        id: "pc-basics",
        title: "Counting Principles",
        content: `**Permutation (Order matters):**
nPr = n! / (n-r)!
Used when arrangement or order is important

**Combination (Order doesn't matter):**
nCr = n! / [r! × (n-r)!]
Used when selection matters, not arrangement`,
        examples: [
          {
            problem: "How many ways can 3 people sit in 5 chairs?",
            solution: "5P3 = 5!/(5-3)! = 5!/2! = 120/2 = 60 ways",
            explanation: "Order matters here (different seating = different arrangement), so use permutation."
          }
        ],
        tips: [
          "Ask: Does order matter? → Permutation : Combination",
          "nC0 = nCn = 1",
          "nCr = nC(n-r)"
        ]
      }
    ]
  }
];

export const reasoningTopics: Topic[] = [
  {
    id: "logical-reasoning",
    name: "Logical Reasoning",
    category: "reasoning",
    icon: "🧠",
    description: "Develop critical thinking and logical analysis skills",
    lessons: [
      {
        id: "lr-basics",
        title: "Introduction to Logical Reasoning",
        content: `Logical reasoning tests your ability to analyze information and draw conclusions.

**Types of Questions:**
1. **Statement & Conclusion** - Determine if conclusions follow from statements
2. **Statement & Assumption** - Identify underlying assumptions
3. **Cause & Effect** - Analyze relationships between events
4. **Syllogisms** - Draw conclusions from premises`,
        examples: [
          {
            problem: "Statement: All cats are animals. All animals need food. Conclusion: All cats need food.",
            solution: "The conclusion is valid.",
            explanation: "If all cats are animals, and all animals need food, then logically all cats must need food (transitive reasoning)."
          }
        ],
        tips: [
          "Read statements carefully - focus on what IS said, not what you assume",
          "Look for absolute words like 'all', 'none', 'always', 'never'",
          "Draw Venn diagrams for syllogism problems"
        ]
      }
    ]
  },
  {
    id: "verbal-reasoning",
    name: "Verbal Reasoning",
    category: "reasoning",
    icon: "📖",
    description: "Enhance comprehension and verbal analysis abilities",
    lessons: [
      {
        id: "vr-basics",
        title: "Verbal Reasoning Essentials",
        content: `Verbal reasoning assesses your ability to understand and reason using words.

**Key Areas:**
1. **Analogies** - Understanding relationships between word pairs
2. **Classification** - Finding the odd one out
3. **Coding-Decoding** - Deciphering patterns in codes
4. **Direction Sense** - Navigation and orientation problems`,
        examples: [
          {
            problem: "Doctor : Patient :: Teacher : ?",
            solution: "Student",
            explanation: "A doctor treats a patient; similarly, a teacher teaches a student. The relationship is professional-client."
          }
        ],
        tips: [
          "Identify the type of relationship first",
          "Common relationships: profession-tool, cause-effect, synonym-antonym",
          "In coding, look for patterns in letter positions"
        ]
      }
    ]
  },
  {
    id: "puzzles",
    name: "Puzzles",
    category: "reasoning",
    icon: "🧩",
    description: "Solve complex puzzles with systematic approaches",
    lessons: [
      {
        id: "puzzle-basics",
        title: "Puzzle Solving Strategies",
        content: `Puzzles require systematic organization of given information.

**Approach:**
1. Read the entire puzzle first
2. Identify all variables (people, items, positions)
3. Create a table or diagram
4. Fill in definite information first
5. Use elimination for remaining clues`,
        examples: [
          {
            problem: "Five people A, B, C, D, E are seated in a row. A is to the left of B but right of E. C is at the right end. D is between A and C. Find the order.",
            solution: "E, A, B, D, C",
            explanation: "Work step by step: C is at right end. E-A-B is the relative order. D is between A and C. Final: E, A, B, D, C."
          }
        ],
        tips: [
          "Always draw a diagram",
          "Start with absolute clues (ends, exact positions)",
          "Check your answer against ALL given clues"
        ]
      }
    ]
  },
  {
    id: "blood-relations",
    name: "Blood Relations",
    category: "reasoning",
    icon: "👨‍👩‍👧‍👦",
    description: "Master family tree and relationship problems",
    lessons: [
      {
        id: "br-basics",
        title: "Understanding Blood Relations",
        content: `Blood relation problems test your understanding of family relationships.

**Key Relationships:**
- **Paternal:** Father's side
- **Maternal:** Mother's side
- **Siblings:** Brothers and sisters
- **Cousins:** Children of uncles/aunts

**Drawing Family Trees:**
- Males: Square □
- Females: Circle ○
- Marriage: Horizontal line —
- Children: Vertical line |`,
        examples: [
          {
            problem: "A is B's brother. C is A's mother. D is C's father. What is B to D?",
            solution: "B is D's grandchild (grandson or granddaughter)",
            explanation: "D is father of C (B's mother), so D is B's grandfather."
          }
        ],
        tips: [
          "Always draw the family tree",
          "Start from the person you know most about",
          "Gender is important - read pronouns carefully"
        ]
      }
    ]
  },
  {
    id: "seating-arrangement",
    name: "Seating Arrangement",
    category: "reasoning",
    icon: "🪑",
    description: "Solve linear and circular seating problems",
    lessons: [
      {
        id: "sa-basics",
        title: "Seating Arrangement Techniques",
        content: `**Types:**
1. **Linear:** People sit in a row (one or two sides)
2. **Circular:** People sit around a round table

**For Circular:**
- Note who faces center vs who faces outside
- Clockwise = Right, Counterclockwise = Left

**For Linear:**
- Define direction (left/right from whose perspective)
- Check if single row or double row (facing each other)`,
        examples: [
          {
            problem: "6 people sit in a circle facing center. A sits opposite B. C is to the left of A. Where does D sit if D is opposite C?",
            solution: "D sits to the right of A (and left of B)",
            explanation: "In a circle facing center, opposite means 3 positions away. Draw the circle to solve."
          }
        ],
        tips: [
          "Always draw the arrangement",
          "Fix one person's position first",
          "In circular: 'facing outside' reverses left/right"
        ]
      }
    ]
  }
];

export const allTopics = [...aptitudeTopics, ...reasoningTopics];

export const sampleQuestions: Record<string, Question[]> = {
  "percentages": [
    {
      id: "p1",
      question: "What is 15% of 200?",
      options: ["25", "30", "35", "40"],
      correctAnswer: 1,
      explanation: "15% of 200 = (15/100) × 200 = 30",
      difficulty: "easy",
      topic: "percentages"
    },
    {
      id: "p2",
      question: "A number increased by 20% gives 60. What is the number?",
      options: ["45", "48", "50", "52"],
      correctAnswer: 2,
      explanation: "Let the number be x. x + 20% of x = 60 → 1.2x = 60 → x = 50",
      difficulty: "medium",
      topic: "percentages"
    },
    {
      id: "p3",
      question: "If the price of an item is reduced by 25% and then increased by 25%, what is the net effect?",
      options: ["No change", "6.25% decrease", "6.25% increase", "25% decrease"],
      correctAnswer: 1,
      explanation: "Let original = 100. After 25% decrease = 75. After 25% increase on 75 = 93.75. Net effect = 6.25% decrease",
      difficulty: "hard",
      topic: "percentages"
    },
    {
      id: "p4",
      question: "Express 3/4 as a percentage.",
      options: ["25%", "50%", "75%", "80%"],
      correctAnswer: 2,
      explanation: "3/4 = 0.75 = 75%",
      difficulty: "easy",
      topic: "percentages"
    },
    {
      id: "p5",
      question: "A student scored 80 marks out of 125. What is the percentage?",
      options: ["60%", "64%", "68%", "72%"],
      correctAnswer: 1,
      explanation: "(80/125) × 100 = 64%",
      difficulty: "easy",
      topic: "percentages"
    }
  ],
  "profit-loss": [
    {
      id: "pl1",
      question: "A shopkeeper buys an item for ₹800 and sells it for ₹1000. What is the profit percentage?",
      options: ["20%", "25%", "30%", "35%"],
      correctAnswer: 1,
      explanation: "Profit = 1000 - 800 = 200. Profit% = (200/800) × 100 = 25%",
      difficulty: "easy",
      topic: "profit-loss"
    },
    {
      id: "pl2",
      question: "If an item is sold at 10% loss, and the selling price is ₹450, what was the cost price?",
      options: ["₹400", "₹450", "₹500", "₹550"],
      correctAnswer: 2,
      explanation: "SP = CP × (1 - Loss%) → 450 = CP × 0.9 → CP = 500",
      difficulty: "medium",
      topic: "profit-loss"
    },
    {
      id: "pl3",
      question: "A trader marks his goods 40% above cost price and gives 20% discount. Find profit%.",
      options: ["10%", "12%", "15%", "20%"],
      correctAnswer: 1,
      explanation: "Let CP = 100. MP = 140. SP = 140 × 0.8 = 112. Profit% = 12%",
      difficulty: "hard",
      topic: "profit-loss"
    }
  ],
  "time-work": [
    {
      id: "tw1",
      question: "A can complete a work in 12 days. What fraction of work does A complete in 1 day?",
      options: ["1/6", "1/10", "1/12", "1/15"],
      correctAnswer: 2,
      explanation: "If A completes work in 12 days, 1-day work = 1/12",
      difficulty: "easy",
      topic: "time-work"
    },
    {
      id: "tw2",
      question: "A and B can do a work in 12 days and 18 days respectively. In how many days can they complete it together?",
      options: ["6.5 days", "7.2 days", "8 days", "9 days"],
      correctAnswer: 1,
      explanation: "Combined rate = 1/12 + 1/18 = 5/36. Time = 36/5 = 7.2 days",
      difficulty: "medium",
      topic: "time-work"
    }
  ],
  "logical-reasoning": [
    {
      id: "lr1",
      question: "Statement: All roses are flowers. All flowers are beautiful. Conclusion: All roses are beautiful.",
      options: ["Definitely True", "Probably True", "Probably False", "Definitely False"],
      correctAnswer: 0,
      explanation: "This follows logically - if all roses are flowers, and all flowers are beautiful, then all roses must be beautiful.",
      difficulty: "easy",
      topic: "logical-reasoning"
    },
    {
      id: "lr2",
      question: "Find the odd one out: Apple, Mango, Potato, Orange, Banana",
      options: ["Apple", "Mango", "Potato", "Banana"],
      correctAnswer: 2,
      explanation: "Potato is a vegetable, while all others are fruits.",
      difficulty: "easy",
      topic: "logical-reasoning"
    }
  ],
  "blood-relations": [
    {
      id: "br1",
      question: "Pointing to a man, a woman says 'His mother is the only daughter of my mother.' How is the woman related to the man?",
      options: ["Aunt", "Mother", "Grandmother", "Sister"],
      correctAnswer: 1,
      explanation: "The only daughter of my mother = myself. So the woman is the man's mother.",
      difficulty: "medium",
      topic: "blood-relations"
    }
  ]
};
