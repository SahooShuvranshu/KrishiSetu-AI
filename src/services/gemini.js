import { GoogleGenerativeAI } from '@google/generative-ai';
import { getTranslation } from '../translations';
import { readApiKey } from './apiKeys';

// The app passes a short code ('en' / 'or' / 'hi'). Handing that straight to the
// prompt asked Gemini to answer "in hi", so it often replied in English or in
// mixed script. Map the code to a real language name for the instruction.
const LANG_NAMES = {
  en: 'English',
  or: 'Odia (ଓଡ଼ିଆ)',
  hi: 'Hindi (हिन्दी)'
};

// Two newline characters, for the blank line between treatment sections.
const GAP = String.fromCharCode(10, 10);

export async function diagnoseCropLeaf(base64Image, language = 'en') {
  const languageName = LANG_NAMES[language] || 'English';
  // The user's own key, from this device. Deliberately no import.meta.env
  // fallback: a key in the bundle is a key published in dist/.
  const API_KEY = readApiKey('gemini');

  if (!API_KEY) {
    throw new Error('No Gemini API key on this device. Add yours in Settings or switch to the offline model.');
  }

  const genAI = new GoogleGenerativeAI(API_KEY);

  const prompt = `You are a world-class agricultural pathologist in India.
Diagnose this crop leaf image accurately for Indian farming conditions.
Return strictly a valid JSON object (no markdown formatting, no code blocks) with exact structure:
{
  "crop_name": "Name of crop (e.g. Rice, Wheat, Cotton, Tomato, Groundnut)",
  "disease_name": "Name of disease or 'Healthy'",
  "confidence": 88,
  "severity": "Low" | "Moderate" | "High" | "Outbreak",
  "symptoms": "Detailed symptoms in ${languageName}",
  "organic_remedy": "Organic / biological treatment in ${languageName}",
  "chemical_remedy": "Chemical treatment dosage in ${languageName}",
  "regenerative_advice": "Soil & crop rotation advice for sustainable recovery in ${languageName}"
}`;

  // Extract exactly the mimeType and base64 string
  const mimeType = base64Image.substring(base64Image.indexOf(":")+1, base64Image.indexOf(";"));
  const base64Data = base64Image.split(',')[1];

  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType || 'image/jpeg'
    }
  };

  let response;
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    response = await model.generateContent([prompt, imagePart]);
  } catch (err) {
    console.warn("Primary model failed, falling back to gemini-1.5-flash", err);
    const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    response = await fallbackModel.generateContent([prompt, imagePart]);
  }

  const text = response.response.text();
  const cleanedText = text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleanedText);
  
  // Map it to match the UI expectations. Section labels are translated, and a
  // section the model left out is dropped rather than printed as "undefined".
  const label = (key, fallback) => {
    const value = getTranslation(language, key);
    return value && value !== key ? value : fallback;
  };

  const sections = [
    `${label('organicLabel', 'Organic')}: ${parsed.organic_remedy || ''}`.trim(),
    `${label('chemicalLabel', 'Chemical')}: ${parsed.chemical_remedy || ''}`.trim(),
    parsed.regenerative_advice ? `${label('advice', 'Advice')}: ${parsed.regenerative_advice}` : null
  ].filter(Boolean);

  return {
    disease: `${parsed.crop_name}: ${parsed.disease_name}`,
    treatment: sections.join(GAP)
  };
}
