import { GoogleGenerativeAI } from '@google/generative-ai';

export async function diagnoseCropLeaf(base64Image, language = 'English') {
  const API_KEY = localStorage.getItem('krishisetu_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY;

  if (!API_KEY) {
    throw new Error("No Gemini API key found. Please add it in settings.");
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
  "symptoms": "Detailed symptoms in ${language}",
  "organic_remedy": "Organic / biological treatment in ${language}",
  "chemical_remedy": "Chemical treatment dosage in ${language}",
  "regenerative_advice": "Soil & crop rotation advice for sustainable recovery in ${language}"
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
  
  // Map it to match the UI expectations
  return {
    disease: `${parsed.crop_name}: ${parsed.disease_name}`,
    treatment: `Organic: ${parsed.organic_remedy}\n\nChemical: ${parsed.chemical_remedy}\n\nAdvice: ${parsed.regenerative_advice}`
  };
}
