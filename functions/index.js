const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const axios = require("axios");
const { defineSecret } = require('firebase-functions/params');

admin.initializeApp();
const db = admin.firestore();

// API Abacate Pay Base URL
const ABACATE_API_URL = "https://api.abacatepay.com/v1";

// Define Secret (Replaces legacy config)
const abacateToken = defineSecret('ABACATE_TOKEN');

// Hardcoded Plans for Security (Source of Truth)
const SUBSCRIPTION_PLANS = [
    {
        id: 'basic_group',
        name: 'Conecta Turma',
        price: 129.90,
        features: { privateClasses: 0, essayCorrections: 0 }
    },
    {
        id: 'standard_personal',
        name: 'Conecta Plus',
        price: 389.90,
        features: { privateClasses: 2, essayCorrections: 0 }
    },
    {
        id: 'elite_mentorship',
        name: 'Conecta Elite',
        price: 749.90,
        features: { privateClasses: 4, essayCorrections: 4 }
    }
];

/**
 * Creates a Checkout Session securely on the server.
 * Called by the frontend via Firebase Functions SDK.
 */
exports.createCheckout = functions.runWith({ secrets: [abacateToken] }).https.onCall(async (data, context) => {
    // 1. Authenticate User
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    }

    const { planId, cpf, phone } = data;
    const userId = context.auth.uid;
    const userEmail = context.auth.token.email;
    const userName = context.auth.token.name || "Aluno";

    // 2. Validate Plan
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid Plan ID');
    }

    // 3. Get API Token securely
    const apiToken = abacateToken.value();

    if (!apiToken) {
        console.error("Missing Abacate Pay Token Secret");
        throw new functions.https.HttpsError('internal', 'Payment configuration missing.');
    }

    // 4. Create Billing at Abacate Pay
    try {
        const priceCents = Math.round(plan.price * 100);
        const payload = {
            frequency: "ONE_TIME",
            methods: ["PIX", "CARD"],
            products: [{
                externalId: plan.id,
                name: plan.name,
                description: `Assinatura ${plan.name}`,
                quantity: 1,
                price: priceCents
            }],
            returnUrl: `https://conecta-portugues.web.app/`, // Update with prod URL
            completionUrl: `https://conecta-portugues.web.app/?billing_success=true&plan=${planId}`,
            customer: {
                name: userName,
                cellphone: phone,
                email: userEmail,
                taxId: cpf
            },
            metadata: {
                userId: userId,
                planId: planId
            }
        };

        const response = await axios.post(`${ABACATE_API_URL}/billing/create`, payload, {
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json'
            }
        });

        const checkoutUrl = response.data.url || response.data.data?.url || response.data.billingUrl;
        return { url: checkoutUrl };

    } catch (error) {
        console.error("Abacate Pay Error:", error.response?.data || error.message);
        throw new functions.https.HttpsError('internal', 'Failed to create payment session.');
    }
});

/**
 * Webhook to handle callbacks from Abacate Pay.
 * Updates the user's subscription in Firestore upon successful payment.
 */
exports.abacateWebhook = functions.https.onRequest(async (req, res) => {
    // Secret verification can be added here if Abacate provides signature headers
    const event = req.body;
    console.log("Webhook Received:", JSON.stringify(event));

    // 2. Parse Event
    // Note: Adjust based on real Abacate Pay webhook payload structure (assumed 'status' and 'metadata')
    const status = event.status || event.data?.status;
    const metadata = event.metadata || event.data?.metadata;

    if (status === 'PAID' && metadata?.userId && metadata?.planId) {
        const { userId, planId } = metadata;
        const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);

        if (plan) {
            try {
                // 3. Update Firestore (Privileged Environment)
                await db.collection('artifacts').doc('conecta-portugues-v1')
                    .collection('public').doc('data')
                    .collection('students').doc(userId).update({
                        subscription: {
                            planId: planId,
                            status: 'active',
                            startedAt: admin.firestore.FieldValue.serverTimestamp(),
                            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                            credits: {
                                privateClasses: plan.features.privateClasses,
                                essayCorrections: plan.features.essayCorrections
                            }
                        }
                    });
                console.log(`Updated subscription for user ${userId} to ${planId}`);
                return res.status(200).send("Success");
            } catch (err) {
                console.error("Firestore Update Error:", err);
                return res.status(500).send("Database Error");
            }
        }
    }

    res.status(200).send("Ignored");
});
