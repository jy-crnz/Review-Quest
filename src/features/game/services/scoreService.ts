import { supabase } from '@/lib/supabase';
import { AttemptSchema, type Attempt } from '@/lib/schemas';

/**
 * Persistence Logic: Handles saving quiz results to Supabase.
 * Engineering Standard: Validate all boundaries before insertion.
 */
export const saveQuizAttempt = async (attempt: Attempt) => {
    // 1. Logic Boundary: Ensure we have a session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        console.warn("No active session. Progress will not be saved to the cloud.");
        return null;
    }

    try {
        // 2. Data Validation: Ensure the object matches our Zod Schema
        const validatedAttempt = AttemptSchema.parse({
            ...attempt,
            userId: session.user.id, // Injecting the real User ID from Auth
            updatedAt: new Date(),
        });

        // 3. Infrastructure Layer: Insert into the 'attempts' table we created
        const { data, error } = await supabase
            .from('attempts')
            .insert({
                quiz_id: validatedAttempt.quizId,
                user_id: validatedAttempt.userId,
                score: validatedAttempt.score,
                xp_earned: validatedAttempt.xpEarned,
                // duration is stored in the metadata or a separate column if needed
            })
            .select()
            .single();

        if (error) throw error;

        // 4. Update Profile XP (Atomic-like update)
        await supabase.rpc('increment_xp', {
            user_id: session.user.id,
            xp_to_add: validatedAttempt.xpEarned
        });

        return data;
    } catch (err) {
        // No Silent Failures
        console.error("Data Access Error:", err);
        throw new Error("Failed to persist quest progress.");
    }
};