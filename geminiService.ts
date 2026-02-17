import { GoogleGenAI } from "@google/genai";
import { MODEL_FAST, MODEL_REASONING, MODEL_IMAGE } from './constants';
import { PropertyDetails, Room, FileData, DiagnosisResult, GlobalProjectDecisions } from './types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION_BASE = `
Actúa como un experto en flipping inmobiliario y Jefe de Obra especializado en Argentina (Flipping Master).
Tu objetivo es generar documentación técnica precisa para contratistas.
Usa terminología local de construcción Argentina.
`;

export const diagnoseRoom = async (room: Room, property: PropertyDetails): Promise<DiagnosisResult> => {
  const isOutdoor = /patio|jardin|jardín|terraza|balcon|balcón|fondo|parque/i.test(room.name);
  let outdoorContext = isOutdoor ? "ATENCIÓN: ESPACIO EXTERIOR. Evalúa paisajismo, solados exterior, impermeabilización y parrillas." : "";

  const prompt = `
  Analiza este ambiente: "${room.name}".
  Propiedad: ${property.type} en ${property.city}. Nivel: ${property.renovationLevel}.
  Superficies: Cubierta ${property.areaCovered}m2, Semi ${property.areaSemi}m2, Libre ${property.areaOpen}m2.
  Dimensiones: ${room.area}m2.
  ${outdoorContext}
  
  TAREA (JSON):
  {
    "structuredAnalysis": {
      "generalState": "Resumen técnico.",
      "pathologies": "Humedad, grietas, etc.",
      "ageSuggestionElectric": "Recambio si >40 años.",
      "ageSuggestionPlumbing": "Recambio si >40 años.",
      "interventions": [{"id":"1", "task":"Tarea", "materials":"Material", "roiJustification":"Valor"}]
    }
  }`;

  const parts = room.images.map(img => ({
    inlineData: { mimeType: img.mimeType, data: img.data.split(',')[1] || img.data }
  }));
  parts.push({ text: prompt } as any);

  const response = await ai.models.generateContent({
    model: MODEL_FAST,
    contents: { parts },
    config: { responseMimeType: "application/json" }
  });

  const json = JSON.parse(response.text || "{}");
  return {
    analysis: json.structuredAnalysis?.generalState || "",
    suggestions: [],
    structuredAnalysis: json.structuredAnalysis
  };
};

export const generateTechnicalPlan = async (rooms: Room[], property: PropertyDetails, globalDecisions: GlobalProjectDecisions): Promise<string> => {
  let globalContext = "### DECISIONES GLOBALES\n";
  if (globalDecisions.electricity === 'approved') globalContext += "- Electricidad: Recambio total norma AEA.\n";
  if (globalDecisions.plumbing === 'approved') globalContext += "- Plomería: Recambio total termofusión.\n";
  if (globalDecisions.painting === 'approved') globalContext += "- Pintura: Integral en toda la propiedad.\n";
  if (globalDecisions.flooring === 'approved') globalContext += `- Pisos: Unificado con material: ${globalDecisions.flooringMaterial}.\n`;

  const prompt = `Genera un INFORME TÉCNICO DE OBRA para ${property.address}.
  SUPERFICIES: Cubierta ${property.areaCovered}m2, Semicubierta ${property.areaSemi}m2, Descubierta ${property.areaOpen}m2.
  ${globalContext}
  Analiza si hay cambios entre Plano Actual y Plano Reforma para incluir demoliciones.
  Detalla tareas por ambiente y por gremio.`;

  const response = await ai.models.generateContent({
    model: MODEL_REASONING,
    contents: prompt
  });
  return response.text || "";
};

export const generateRoomRender = async (
    room: Room, 
    imageIndex: number,
    customInstruction?: string,
    globalDecisions?: GlobalProjectDecisions
): Promise<string | null> => {
  const referenceImage = room.images[imageIndex];
  const base64Data = referenceImage.data.split(',')[1] || referenceImage.data;

  let aestheticRules = "";
  if (globalDecisions?.flooring === 'approved') {
      aestheticRules += `REGLA PISOS: Usa obligatoriamente ${globalDecisions.flooringMaterial || "Porcelanato Simil Madera"}. `;
  }
  if (globalDecisions?.painting === 'approved') {
      aestheticRules += "REGLA PAREDES: Pintura nueva, acabado liso impecable. ";
  }

  const prompt = `
  Visualizador arquitectónico. 
  ${aestheticRules}
  INSTRUCCIONES ESPECÍFICAS: "${customInstruction || "Remodelar según diagnóstico"}".
  CONSERVA LA PERSPECTIVA. Estilo moderno argentino.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_IMAGE,
    contents: {
      parts: [
        { inlineData: { mimeType: referenceImage.mimeType, data: base64Data } },
        { text: prompt }
      ]
    },
  });

  for (const part of response.candidates?.[0].content.parts || []) {
    if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
  }
  return null;
};