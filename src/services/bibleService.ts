import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface BibleVerse {
  text: string;
  reference: string;
  context?: string;
}

export interface DailyPrayer {
  morning: string;
  night: string;
}

export interface DailyMessage {
  title: string;
  content: string;
  reference?: string;
}

export async function getDailyVerse(): Promise<BibleVerse> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Forneça um versículo bíblico inspirador e aleatório em Português. Inclua o texto do versículo, a referência (Livro Capítulo:Versículo) e uma breve reflexão futurista/moderna sobre como esse versículo se aplica hoje.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          reference: { type: Type.STRING },
          context: { type: Type.STRING },
        },
        required: ["text", "reference", "context"],
      },
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return {
      text: "O Senhor é o meu pastor, nada me faltará.",
      reference: "Salmos 23:1",
      context: "Mesmo em um mundo de incertezas tecnológicas, a guia divina permanece constante.",
    };
  }
}

export async function getDailyPrayers(): Promise<DailyPrayer> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Forneça duas orações inspiradoras para hoje em Português: uma 'Oração da Manhã' e uma 'Oração da Noite'. Devem ser profundas e modernas.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          morning: { type: Type.STRING },
          night: { type: Type.STRING },
        },
        required: ["morning", "night"],
      },
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return {
      morning: "Senhor, obrigado por este novo dia. Que minha luz brilhe hoje.",
      night: "Pai, entrego meu descanso em tuas mãos. Proteja meus sonhos.",
    };
  }
}

export async function getDailyMessage(): Promise<DailyMessage> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Forneça uma 'Mensagem do Dia' baseada em uma parábola ou versículo bíblico em Português. Inclua um título, o conteúdo da mensagem e a referência bíblica.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING },
          reference: { type: Type.STRING },
        },
        required: ["title", "content", "reference"],
      },
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return {
      title: "A Semente de Mostarda",
      content: "Pequenos começos levam a grandes destinos quando plantados na fé.",
      reference: "Mateus 13:31-32",
    };
  }
}
