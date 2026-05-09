import { useLiveQuery } from "dexie-react-hooks";
import Dexie, { type Table } from "dexie";
import { type Quiz } from "@/utils/types";

/**
 * Dexie database setup
 */
class QuizDB extends Dexie {
    quizzes!: Table<Quiz>;

    constructor() {
        super("QuizDatabase");
        this.version(1).stores({
            quizzes: "id, title, createdAt, updatedAt",
        });
    }
}

export const db = new QuizDB();

/**
 * Hook and utility functions for managing quizzes
 */
export function useQuizDB() {

    // ✅ Live reactive list of quizzes
    const quizzes = useLiveQuery(
        async () => {
                const all = await db.quizzes.toArray();
                // Sort newest first (descending by createdAt)
                return all.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
            },
        [],
        []
    );

    /**
     * Get one quiz by ID
     */ 
    const getQuiz = async (id: string): Promise<Quiz | undefined> => {
        return db.quizzes.get(id);
    };

    /**
     * Add or update quiz
     * If quiz with same ID exists, it will update instead.
     */
    const saveQuiz = async (quiz: Quiz): Promise<void> => {
        const now = new Date().toISOString();
        await db.quizzes.put({
            ...quiz,
            updatedAt: now,
            createdAt: quiz.createdAt || now,
        });
    };

    /**
     * Delete quiz by ID
     */
    const deleteQuiz = async (id: string): Promise<void> => {
        await db.quizzes.delete(id);
    };

    /**
     * Clear all quizzes (optional helper)
     */
    const clearAll = async (): Promise<void> => {
        await db.quizzes.clear();
    };

    return {
        quizzes,
        getQuiz,
        saveQuiz,
        deleteQuiz,
        clearAll,
    };
}
