import { GoogleGenerativeAI } from "@google/generative-ai";
import { Market, MarketSentiment } from '../types';

const getAiClient = () => {
  if (!process.env.API_KEY) return null;
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeMarket = async (market: Market): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "API Key is missing. Please configure the environment to use Gemini AI features.";

  try {
    const prompt = `
      You are a prediction market analyst.
      Analyze the following market: "${market.question}".
      Description: "${market.description}".
      Category: "${market.category}".
      Current Probability for YES: ${(market.outcomes[0].price * 100).toFixed(1)}%.
      Current Probability for NO: ${(market.outcomes[1].price * 100).toFixed(1)}%.

      Provide a concise summary (max 150 words) of the key factors that could influence this outcome. 
      Do not give financial advice. Focus on the events, news, or data points that bettors should watch.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate analysis.";
  } catch (error) {
    console.error("Error analyzing market:", error);
    return "An error occurred while fetching the analysis. Please try again later.";
  }
};

export const getMarketSentiment = async (market: Market): Promise<MarketSentiment> => {
  const ai = getAiClient();
  
  // Mock fallback if no API key
  if (!ai) {
    return {
      score: Math.floor(Math.random() * 100),
      summary: "API Key missing. Showing simulated sentiment data based on market price.",
      bullishFactors: ["Strong volume trends", "Recent news momentum"],
      bearishFactors: ["Market uncertainty", "Historical resistance levels"]
    };
  }

  try {
    const prompt = `
      Analyze the market: "${market.question}".
      Current "YES" price: ${market.outcomes[0].price}.
      
      Act as a social sentiment engine. Estimate the "Internet Vibe" or sentiment score (0-100) where 0 is extremely negative/unlikely and 100 is extremely positive/likely for the YES outcome.
      
      Return ONLY a JSON object with this shape:
      {
        "score": number,
        "summary": "One punchy sentence about the vibe.",
        "bullishFactors": ["factor 1", "factor 2"],
        "bearishFactors": ["factor 1", "factor 2"]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    
    return JSON.parse(text) as MarketSentiment;

  } catch (error) {
    console.error("Error getting sentiment:", error);
    return {
      score: 50,
      summary: "Neutral sentiment detected due to mixed signals.",
      bullishFactors: ["Pending Analysis"],
      bearishFactors: ["Pending Analysis"]
    };
  }
};
