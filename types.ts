// Enums for strict typing of visual logic
export enum ElementType {
  Text = 'TEXT',
  Image = 'IMAGE',
  Shape = 'SHAPE'
}

export enum LayoutStrategy {
  GoldenRatio = 'GOLDEN_RATIO',
  RuleOfThirds = 'RULE_OF_THIRDS',
  CenteredMinimal = 'CENTERED_MINIMAL',
  Asymmetrical = 'ASYMMETRICAL',
  GridSystem = 'GRID_SYSTEM'
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number | string;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  lineHeight: number;
  letterSpacing: number;
}

export interface SlideElement {
  id: string;
  type: ElementType;
  content: string; // Text content or Image URL
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  style?: TextStyle;
  zIndex: number;
  opacity?: number;
}

export interface Slide {
  id: string;
  layoutStrategy: LayoutStrategy;
  elements: SlideElement[];
  backgroundColor: string;
  notes?: string;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface TypographyTheme {
  headingFont: string;
  bodyFont: string;
}

export interface Presentation {
  id: string;
  title: string;
  palette: ColorPalette;
  typography: TypographyTheme;
  slides: Slide[];
}

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720; // 16:9 Aspect Ratio
