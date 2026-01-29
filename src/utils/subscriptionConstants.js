export const SUBSCRIPTION_PLANS = [
    {
        id: 'free',
        name: 'Visitante',
        price: 0,
        features: {
            appAccess: true,
            groupClasses: false,
            privateClasses: 0,
            essayCorrections: 0,
            simulados: false,
            detailedReports: false,
            humanMonitoring: false
        },
        description: 'Acesso restrito para conhecer a plataforma.',
        buttonText: 'Atual'
    },
    {
        id: 'basic_group',
        name: 'Conecta Turma',
        price: 129.90,
        features: {
            appAccess: true,
            groupClasses: true,
            privateClasses: 0,
            essayCorrections: 0,
            simulados: true,
            detailedReports: false,
            humanMonitoring: false
        },
        description: 'Ideal para quem busca rotina e aulas em grupo.',
        buttonText: 'Assinar'
    },
    {
        id: 'standard_personal',
        name: 'Conecta Plus',
        price: 389.90,
        features: {
            appAccess: true,
            groupClasses: true,
            privateClasses: 2,
            essayCorrections: 0,
            simulados: true,
            detailedReports: true,
            humanMonitoring: false
        },
        description: 'Acompanhamento mais próximo com aulas individuais.',
        buttonText: 'Assinar'
    },
    {
        id: 'elite_mentorship',
        name: 'Conecta Elite',
        price: 749.90,
        features: {
            appAccess: true,
            groupClasses: true,
            privateClasses: 4,
            essayCorrections: 4,
            simulados: true,
            detailedReports: true,
            humanMonitoring: true
        },
        description: 'Mentoria completa para alta performance.',
        buttonText: 'Assinar'
    }
];

export const getPlanDetails = (planId) => {
    return SUBSCRIPTION_PLANS.find(p => p.id === planId) || SUBSCRIPTION_PLANS[0];
};

export const checkFeatureAccess = (user, feature) => {
    if (!user || !user.subscription) return false;
    const plan = getPlanDetails(user.subscription.planId);

    // Check for specific feature flags
    if (feature === 'groupClasses') return plan.features.groupClasses;
    if (feature === 'simulados') return plan.features.simulados;
    if (feature === 'reports') return plan.features.detailedReports;

    // Check for credits
    if (feature === 'privateClass') return (user.subscription.credits?.privateClasses || 0) > 0;
    if (feature === 'essay') return (user.subscription.credits?.essayCorrections || 0) > 0;

    return false;
};
