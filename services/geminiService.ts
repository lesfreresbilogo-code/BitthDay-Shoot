import { GoogleGenAI, Modality } from "@google/genai";

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
            resolve(result.split(',')[1]);
        };
        reader.onerror = error => reject(error);
    });
};

export const generateBirthdayShoot = async (
    imageFile: File,
    age: string,
    outfit: string
): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY is not defined in environment variables.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const base64ImageData = await fileToBase64(imageFile);
    
    const imagePart = {
        inlineData: {
            data: base64ImageData,
            mimeType: imageFile.type,
        },
    };

    let promptText = "En utilisant le visage fourni, générez une image de séance photo d'anniversaire hyper stylée et festive. La personne doit être au centre de l'attention, l'air heureux et à la mode. Pensez à des couleurs vives, des confettis, des ballons ou un décor de fête chic. L'ambiance générale doit être joyeuse et sophistiquée.";

    if (outfit) {
        promptText += ` La personne porte une tenue de style '${outfit}'.`;
    }

    if (age && !isNaN(parseInt(age, 10))) {
        promptText += ` Elle tient ou est à côté de grands ballons brillants en forme du nombre ${age}.`;
    }

    const textPart = {
        text: promptText,
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [imagePart, textPart],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        // Extract the generated image data
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }

        throw new Error("Aucune image n'a été générée par l'API.");

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate image with Gemini API.");
    }
};