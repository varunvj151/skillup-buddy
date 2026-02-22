import { describe, it, expect } from 'vitest';
import { testQuestions, getQuestionsForTopic } from './testQuestions';

describe('Question Bank Integration', () => {
    it('should have a large number of questions loaded', () => {
        // We expect around 23 topics * 60 questions = 1380 questions
        // Allow for some variance if some files are slightly different, but should be > 1000
        expect(testQuestions.length).toBeGreaterThan(1000);
        console.log(`Total questions loaded: ${testQuestions.length}`);
    });

    it('should load questions for new Reasoning topics', () => {
        const topicsToCheck = [
            'non-verbal-reasoning',
            'blood-relations',
            'seating-arrangement',
            'coding-decoding',
            'direction-sense',
            'syllogisms',
            'puzzles',
            'data-sufficiency',
            'analogy-series'
        ];

        topicsToCheck.forEach(topicId => {
            const questions = getQuestionsForTopic(topicId);
            expect(questions.length).toBeGreaterThan(0);
            expect(questions[0].topicId).toBe(topicId);
        });
    });

    it('should ensure no duplicate IDs across the entire bank', () => {
        const ids = new Set<string>();
        const duplicates: string[] = [];

        testQuestions.forEach(q => {
            if (ids.has(q.id)) {
                duplicates.push(q.id);
            }
            ids.add(q.id);
        });

        if (duplicates.length > 0) {
            console.error('Duplicate IDs found:', duplicates);
        }
        expect(duplicates.length).toBe(0);
    });

    it('should ensure all questions have valid difficulty levels', () => {
        const validDifficulties = ['easy', 'medium', 'hard'];
        const invalidQuestions = testQuestions.filter(q => !validDifficulties.includes(q.difficulty));

        if (invalidQuestions.length > 0) {
            console.error('Invalid difficulty questions:', invalidQuestions.map(q => q.id));
        }
        expect(invalidQuestions.length).toBe(0);
    });
});
