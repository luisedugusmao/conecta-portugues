import { SUBSCRIPTION_PLANS } from '../utils/subscriptionConstants';

const API_URL = 'https://api.abacatepay.com/v1';

export const createCheckoutSession = async (planId, user) => {
    const token = import.meta.env.VITE_ABACATE_PAY_TOKEN;

    if (!token) {
        console.error("Abacate Pay Token not found");
        throw new Error("Configuração de pagamento ausente. Contate o suporte.");
    }

    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) throw new Error("Plano não encontrado");

    // Convert price to absolute integer (cents)
    const priceCents = Math.round(plan.price * 100);

    const payload = {
        frequency: "ONE_TIME",
        methods: ["PIX", "CARD"],
        products: [
            {
                externalId: plan.id,
                name: plan.name,
                description: plan.description,
                quantity: 1,
                price: priceCents
            }
        ],
        returnUrl: `${window.location.origin}/`,
        completionUrl: `${window.location.origin}/?billing_success=true&plan=${planId}`,
        // customerId: user.id, // REMOVED: Let Abacate create/match by email/cpf to avoid 'not found' or format errors
        customer: {
            name: user.name,
            cellphone: user.phone,
            email: user.email || 'aluno@conectaportugues.com.br',
            taxId: user.cpf
        }
    };

    try {
        const response = await fetch(`${API_URL}/billing/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("🥑 Abacate Pay Response Full:", data);

        if (!response.ok) {
            console.error("Abacate Pay Error:", data);
            throw new Error(data.error?.message || "Erro ao criar pagamento");
        }

        // Try to find the URL in common locations
        const checkoutUrl = data.url || data.data?.url || data.billingUrl;

        if (!checkoutUrl) {
            console.error("URL not found in response:", data);
            alert("Debug: URL de pagamento não encontrada. Veja o console.");
        }

        return checkoutUrl;
    } catch (error) {
        console.error("Payment Error:", error);
        throw error;
    }
};
