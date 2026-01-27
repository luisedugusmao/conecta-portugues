import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
let model = null;

if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
}

export const getExplanation = async (question, answer, isCorrect, studentAnswer, options) => {
    if (!API_KEY || !model) {
        console.warn("Gemini API Key is missing. Returning default fallback.");
        return null;
    }

    try {
        const prompt = `
        Você é um professor de português experiente. O aluno respondeu uma questão de simulado.
        
        Questão: "${question}"
        Opções: ${options ? options.join(', ') : 'N/A'}
        Resposta Correta: "${answer}"
        Resposta do Aluno: "${studentAnswer}"
        Status: ${isCorrect ? "Acertou" : "Errou"}

        Tarefa: Forneça uma explicação concisa (max 2-3 frases) e didática explicando por que a resposta correta é a correta e, se o aluno errou, por que a resposta dele pode estar errada ou qual o conceito gramatical envolvido.
        Tom de voz: Encorajador e direto. Não use saudações como "Olá" ou "Tudo bem". Vá direto ao ponto.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating explanation with Gemini:", error);
        return null;
    }
};

export const generateConceptExplanation = async (question, answer, options) => {
    if (!API_KEY || !model) {
        return null;
    }

    try {
        const prompt = `
        Você é um professor de português experiente criando um simulado.
        
        Questão: "${question}"
        Opções: ${options ? options.join(', ') : 'N/A'}
        Resposta Correta: "${answer}"

        Tarefa: Crie uma explicação CLARA, DIDÁTICA e CONCISA (máximo 30 palavras) sobre por que essa é a resposta correta e qual o conceito gramatical/linguístico envolvido.
        Público: Alunos do ensino fundamental II (6º ao 9º ano).
        Tom: Educativo e direto. Explique o conceito.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating concept explanation:", error);
        return null;
    }
};
