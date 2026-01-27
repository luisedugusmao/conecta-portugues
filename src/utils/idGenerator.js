import { doc, getDoc, setDoc, runTransaction } from 'firebase/firestore';
import { db, appId } from '../firebase';

/**
 * Generates a sequential ID for a given entity type.
 * format: {PREFIX}-{NUMBER} (e.g. AULA-1, AULA-2)
 * 
 * @param {string} entityType - 'classes', 'quizzes', 'students'
 * @param {string} prefix - The prefix to use (e.g. 'AULA', 'QUIZ')
 * @returns {Promise<string>} The generated ID
 */
export const generateNextId = async (entityType, prefix) => {
    const counterRef = doc(db, 'artifacts', appId, 'public', 'counters');

    try {
        const newId = await runTransaction(db, async (transaction) => {
            const counterDoc = await transaction.get(counterRef);

            let currentCount = 0;
            if (counterDoc.exists()) {
                const data = counterDoc.data();
                currentCount = data[entityType] || 0;
            }

            const nextCount = currentCount + 1;

            // Update the counter
            transaction.set(counterRef, {
                [entityType]: nextCount
            }, { merge: true });

            // Return standardized string, e.g., 'AULA-001'
            // Pad with leading zeros for sorting consistency (e.g. 001, 002... 010)
            const paddedNum = nextCount.toString().padStart(3, '0');
            return `${prefix}-${paddedNum}`;
        });

        return newId;
    } catch (error) {
        console.error(`Error generating ID for ${entityType}:`, error);
        // Fallback to timestamp if transaction fails
        return `${prefix.toLowerCase()}_${Date.now()}`;
    }
};
