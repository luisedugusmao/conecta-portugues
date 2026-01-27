
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.VITE_GEMINI_API_KEY;

const run = async () => {
    console.log("Fetching available models via REST API...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("\nAvailable Models:");
            data.models.forEach(m => {
                // Filter for generateContent support
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name} (Version: ${m.version})`);
                }
            });

            // Try the first available one as a test
            const firstModel = data.models.find(m => m.supportedGenerationMethods.includes("generateContent"));
            if (firstModel) {
                const modelName = firstModel.name.replace('models/', '');
                console.log(`\nSuggesting model: ${modelName}`);
            }

        } else {
            console.error("No models list returned. Error data:", JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error("Error listing models:", err);
    }
};

run();
