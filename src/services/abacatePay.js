import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

/**
 * Initiates a secure checkout flow via Cloud Functions.
 * 
 * @param {string} planId - The ID of the plan (e.g., 'conecta_elite')
 * @param {object} user - User object containing { cpf, phone, etc }
 * @returns {Promise<string>} - The Checkout URL
 */
export const createCheckoutSession = async (planId, user) => {
    try {
        const createCheckout = httpsCallable(functions, 'createCheckout');

        console.log("Calling Cloud Function: createCheckout with", { planId });

        const { data } = await createCheckout({
            planId: planId,
            cpf: user.cpf,
            phone: user.phone
        });

        if (!data || !data.url) {
            throw new Error("Resposta inválida do servidor.");
        }

        return data.url;
    } catch (error) {
        console.error("Cloud Function Error:", error);
        throw new Error(error.message || "Erro ao conectar com servidor de pagamento.");
    }
};
