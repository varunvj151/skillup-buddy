export type Difficulty = 'easy' | 'medium' | 'hard';

export interface TestQuestion {
    id: string;
    topicId: string;
    difficulty: Difficulty;
    question: string;
    options: string[];
    correctAnswer: number; // Index 0-3
    explanation: string;
}

// --- Aptitude Question Imports ---
import { percentagesQuestions } from './questions/percentages';
import { profitLossQuestions } from './questions/profitLoss';
import { timeWorkQuestions } from './questions/timeWork';
import { tsdQuestions } from './questions/tsd';
import { siCiQuestions } from './questions/siCi';
import { ratioProportionQuestions } from './questions/ratioProportion';
import { averagesQuestions } from './questions/averages';
import { numberSystemQuestions } from './questions/numberSystem';
import { permCombQuestions } from './questions/permComb';
import { probabilityQuestions } from './questions/probability';
import { mixturesQuestions } from './questions/mixtures';
import { pipesCisternsQuestions } from './questions/pipesCisterns';

// --- Reasoning Question Imports ---
import { logicalReasoningQuestions } from './questions/logicalReasoning';
import { verbalReasoningQuestions } from './questions/verbalReasoning';
import { nonVerbalReasoningQuestions } from './questions/nonVerbalReasoning';
import { bloodRelationsQuestions } from './questions/bloodRelations';
import { seatingArrangementQuestions } from './questions/seatingArrangement';
import { codingDecodingQuestions } from './questions/codingDecoding';
import { directionSenseQuestions } from './questions/directionSense';
import { syllogismsQuestions } from './questions/syllogisms';
import { puzzlesQuestions } from './questions/puzzles';
import { dataSufficiencyQuestions } from './questions/dataSufficiency';
import { analogySeriesQuestions } from './questions/analogySeries';

// Combine all questions into one master array
export const testQuestions: TestQuestion[] = [
    // Aptitude
    ...percentagesQuestions,
    ...profitLossQuestions,
    ...timeWorkQuestions,
    ...tsdQuestions,
    ...siCiQuestions,
    ...ratioProportionQuestions,
    ...averagesQuestions,
    ...numberSystemQuestions,
    ...permCombQuestions,
    ...probabilityQuestions,
    ...mixturesQuestions,
    ...pipesCisternsQuestions,
    // Reasoning
    ...logicalReasoningQuestions,
    ...verbalReasoningQuestions,
    ...nonVerbalReasoningQuestions,
    ...bloodRelationsQuestions,
    ...seatingArrangementQuestions,
    ...codingDecodingQuestions,
    ...directionSenseQuestions,
    ...syllogismsQuestions,
    ...puzzlesQuestions,
    ...dataSufficiencyQuestions,
    ...analogySeriesQuestions,
];

// Helper to get questions
export const getQuestionsForTopic = (
    topicId: string,
    difficulty: string = 'mixed',
    limit: number = 10
): TestQuestion[] => {
    let filtered = testQuestions.filter(q => q.topicId === topicId);

    if (difficulty !== 'mixed') {
        filtered = filtered.filter(q => q.difficulty === difficulty);
    }

    // Shuffle array
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());

    return shuffled.slice(0, limit);
};
