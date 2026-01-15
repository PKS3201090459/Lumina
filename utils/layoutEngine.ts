import { SlideElement, ElementType, LayoutStrategy, CANVAS_WIDTH, CANVAS_HEIGHT, TextStyle } from '../types';

// Constants
const PHI = 1.61803398875; // Golden Ratio
const PADDING = 60;

const generateId = () => Math.random().toString(36).substr(2, 9);

interface LayoutInput {
  title: string;
  subtitle?: string;
  bodyPoints?: string[];
  imageUrl?: string; // If null, generate a text-only layout
  layoutStrategy: LayoutStrategy;
  colors: { text: string; accent: string };
  fonts: { heading: string; body: string };
}

/**
 * The Core Algorithmic Layout Engine.
 * Instead of templates, we calculate coordinates based on mathematical principles.
 */
export const generateLayout = (input: LayoutInput): SlideElement[] => {
  const elements: SlideElement[] = [];
  const { layoutStrategy, title, subtitle, bodyPoints, imageUrl, colors, fonts } = input;

  const w = CANVAS_WIDTH;
  const h = CANVAS_HEIGHT;

  // Helper to create text
  const addText = (text: string, x: number, y: number, w: number, fontSize: number, weight: string | number, color: string, align: 'left' | 'center' | 'right' = 'left'): SlideElement => ({
    id: generateId(),
    type: ElementType.Text,
    content: text,
    x, y, width: w, height: fontSize * 1.5, // Approx height
    zIndex: 10,
    style: {
      fontFamily: weight === 700 ? fonts.heading : fonts.body,
      fontSize,
      fontWeight: weight,
      color,
      textAlign: align,
      lineHeight: 1.4,
      letterSpacing: weight === 700 ? -0.02 : 0
    }
  });

  // Helper to create image
  const addImage = (url: string, x: number, y: number, w: number, h: number): SlideElement => ({
    id: generateId(),
    type: ElementType.Image,
    content: url,
    x, y, width: w, height: h,
    zIndex: 1,
  });

  // --- STRATEGY: GOLDEN RATIO ---
  if (layoutStrategy === LayoutStrategy.GoldenRatio) {
    // Split canvas by PHI
    const majorWidth = w / PHI;
    const minorWidth = w - majorWidth;
    
    if (imageUrl) {
      // Image takes the major section (Visual dominance)
      elements.push(addImage(imageUrl, 0, 0, majorWidth, h));
      
      // Content in the minor section (Golden Rectangle)
      let currentY = PADDING * 2;
      elements.push(addText(title, majorWidth + PADDING, currentY, minorWidth - (PADDING * 2), 48, 700, colors.text));
      currentY += 80;
      
      if (subtitle) {
        elements.push(addText(subtitle, majorWidth + PADDING, currentY, minorWidth - (PADDING * 2), 24, 400, colors.accent));
        currentY += 50;
      }
      
      if (bodyPoints) {
        bodyPoints.forEach(point => {
          elements.push(addText(`• ${point}`, majorWidth + PADDING, currentY, minorWidth - (PADDING * 2), 20, 300, colors.text));
          currentY += 35;
        });
      }
    } else {
      // Text Only Golden Ratio - Spiral Focus
      // Title at the "eye" of the spiral roughly
      elements.push(addText(title, PADDING, h / 3, majorWidth, 72, 700, colors.text));
      if (bodyPoints) {
         let currentY = h / 3 + 100;
         bodyPoints.forEach(point => {
           elements.push(addText(point, PADDING, currentY, majorWidth, 24, 400, colors.text));
           currentY += 40;
         });
      }
    }
  } 
  
  // --- STRATEGY: RULE OF THIRDS ---
  else if (layoutStrategy === LayoutStrategy.RuleOfThirds) {
    const thirdW = w / 3;
    const thirdH = h / 3;

    if (imageUrl) {
      // Image occupies right 2/3
      elements.push(addImage(imageUrl, thirdW, 0, thirdW * 2, h));
      
      // Text in left 1/3, vertically aligned to intersections
      elements.push(addText(title, PADDING, thirdH - 50, thirdW - (PADDING), 56, 700, colors.text, 'right'));
      if (subtitle) {
         elements.push(addText(subtitle, PADDING, thirdH + 30, thirdW - (PADDING), 24, 400, colors.accent, 'right'));
      }
    } else {
      // Strong typograhpy on grid lines
      elements.push(addText(title, thirdW, thirdH, thirdW * 2, 64, 700, colors.text));
       if (bodyPoints) {
        let startX = thirdW;
        let startY = thirdH + 100;
        bodyPoints.forEach(point => {
            elements.push(addText(point, startX, startY, thirdW * 1.5, 22, 300, colors.text));
            startY += 35;
        });
       }
    }
  }

  // --- STRATEGY: CENTERED MINIMAL ---
  else {
    const contentWidth = w * 0.6;
    const startX = (w - contentWidth) / 2;
    let currentY = h * 0.3;

    elements.push(addText(title, startX, currentY, contentWidth, 64, 700, colors.text, 'center'));
    currentY += 90;

    if (imageUrl) {
        // Small focused image
        const imgH = 300;
        const imgW = contentWidth * 0.8;
        elements.push(addImage(imageUrl, (w - imgW)/2, currentY, imgW, imgH));
        currentY += imgH + 40;
    }

    if (bodyPoints) {
        bodyPoints.forEach(point => {
            elements.push(addText(point, startX, currentY, contentWidth, 24, 400, colors.text, 'center'));
            currentY += 40;
        });
    }
  }

  return elements;
};
