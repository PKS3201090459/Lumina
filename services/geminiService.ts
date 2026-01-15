import { GoogleGenAI, Type } from "@google/genai";
import { Presentation, Slide, LayoutStrategy, CANVAS_WIDTH, CANVAS_HEIGHT, ElementType, SlideElement } from '../types';
import { generateLayout } from '../utils/layoutEngine';

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key not found");
    return new GoogleGenAI({ apiKey });
}

interface RawSlideData {
    title: string;
    subtitle?: string;
    layoutPreference: string;
    keyPoints: string[];
    imageDescription?: string;
    notes?: string;
}

interface RawPresentationData {
    title: string;
    colorPalette: {
        background: string;
        primary: string;
        secondary: string;
        accent: string;
        text: string;
    };
    typography: {
        headingFont: string;
        bodyFont: string;
    };
    rawSlides: RawSlideData[];
}

export const generatePresentationContent = async (topic: string): Promise<Presentation> => {
    const ai = getClient();
    
    // We ask Gemini for the *content* and *design choices*, but we will do the coordinate calculations ourselves
    // to ensure the layout is mathematically perfect on our canvas.
    const prompt = `
    You are a world-class Design Director. Create a presentation about: "${topic}".
    
    Design requirements:
    1. Create a bespoke color palette (hex codes) fitting the mood.
    2. Choose 2 complimentary fonts (Google Fonts names).
    3. Create 4-6 slides.
    4. For each slide, determine the best layout strategy (GOLDEN_RATIO, RULE_OF_THIRDS, CENTERED_MINIMAL).
    5. Provide an abstract description of an image if one enhances the slide (use unsplash-style keywords).
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    colorPalette: {
                        type: Type.OBJECT,
                        properties: {
                            background: { type: Type.STRING },
                            primary: { type: Type.STRING },
                            secondary: { type: Type.STRING },
                            accent: { type: Type.STRING },
                            text: { type: Type.STRING }
                        },
                        required: ['background', 'primary', 'secondary', 'accent', 'text']
                    },
                    typography: {
                        type: Type.OBJECT,
                        properties: {
                            headingFont: { type: Type.STRING },
                            bodyFont: { type: Type.STRING }
                        },
                        required: ['headingFont', 'bodyFont']
                    },
                    rawSlides: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                subtitle: { type: Type.STRING },
                                layoutPreference: { type: Type.STRING, enum: ['GOLDEN_RATIO', 'RULE_OF_THIRDS', 'CENTERED_MINIMAL'] },
                                keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                                imageDescription: { type: Type.STRING },
                                notes: { type: Type.STRING }
                            },
                            required: ['title', 'layoutPreference', 'keyPoints']
                        }
                    }
                },
                required: ['title', 'colorPalette', 'typography', 'rawSlides']
            }
        }
    });

    if (!response.text) throw new Error("No response from AI");
    
    const data = JSON.parse(response.text) as RawPresentationData;

    // Post-process: Convert abstract AI data into Coordinate-based Slides
    const slides: Slide[] = data.rawSlides.map((raw, index) => {
        // Map abstract layout preference to Enum
        let strategy = LayoutStrategy.RuleOfThirds;
        if (raw.layoutPreference === 'GOLDEN_RATIO') strategy = LayoutStrategy.GoldenRatio;
        if (raw.layoutPreference === 'CENTERED_MINIMAL') strategy = LayoutStrategy.CenteredMinimal;

        // Generate image URL based on description (using picsum/placeholder for demo, realistic implementation would use Imagen)
        // We use seed to keep it consistent
        const imgUrl = raw.imageDescription 
            ? `https://picsum.photos/seed/${index + topic.length}/800/600`
            : undefined;

        const elements = generateLayout({
            title: raw.title,
            subtitle: raw.subtitle,
            bodyPoints: raw.keyPoints,
            imageUrl: imgUrl,
            layoutStrategy: strategy,
            colors: { text: data.colorPalette.text, accent: data.colorPalette.accent },
            fonts: { heading: data.typography.headingFont, body: data.typography.bodyFont }
        });

        // Add background shape
        const bg: SlideElement = {
            id: 'bg-' + index,
            type: ElementType.Shape,
            content: '',
            x: 0, y: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT,
            zIndex: 0,
            style: { 
                color: data.colorPalette.background, 
                fontFamily: '', fontSize: 0, fontWeight: 400, textAlign: 'left', lineHeight: 0, letterSpacing: 0 
            }
        };

        return {
            id: `slide-${index}`,
            layoutStrategy: strategy,
            backgroundColor: data.colorPalette.background,
            notes: raw.notes,
            elements: [bg, ...elements]
        };
    });

    return {
        id: Date.now().toString(),
        title: data.title,
        palette: data.colorPalette,
        typography: data.typography,
        slides
    };
};