import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Text, Image as KonvaImage, Rect, Transformer } from 'react-konva';
import useImage from 'use-image';
import { Slide, SlideElement, ElementType, CANVAS_WIDTH, CANVAS_HEIGHT } from '../types';

interface CanvasSlideProps {
  slide: Slide;
  scale: number;
  isSelected?: boolean;
  onElementChange?: (slideId: string, elementId: string, newAttrs: Partial<SlideElement>) => void;
  readOnly?: boolean;
}

const URLImage = ({ src, ...props }: any) => {
  const [image] = useImage(src, 'anonymous'); // 'anonymous' for CORS
  return <KonvaImage image={image} {...props} />;
};

export const CanvasSlide: React.FC<CanvasSlideProps> = ({ slide, scale, onElementChange, readOnly = false }) => {
  const [selectedId, selectShape] = React.useState<string | null>(null);
  const trRef = useRef<any>(null);
  const layerRef = useRef<any>(null);

  // Deselect when clicking empty area
  const checkDeselect = (e: any) => {
    if (readOnly) return;
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
    }
  };

  useEffect(() => {
    if (readOnly) return;
    if (selectedId && trRef.current && layerRef.current) {
      // Find the node
      const node = layerRef.current.findOne('#' + selectedId);
      if (node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedId, readOnly]);

  return (
    <div 
      className="shadow-2xl overflow-hidden bg-white"
      style={{ width: CANVAS_WIDTH * scale, height: CANVAS_HEIGHT * scale }}
    >
      <Stage 
        width={CANVAS_WIDTH * scale} 
        height={CANVAS_HEIGHT * scale} 
        scaleX={scale} 
        scaleY={scale}
        onMouseDown={checkDeselect}
        onTouchStart={checkDeselect}
      >
        <Layer ref={layerRef}>
            {/* Render Elements */}
            {slide.elements.map((el, i) => {
                const commonProps = {
                    key: el.id,
                    id: el.id,
                    x: el.x,
                    y: el.y,
                    width: el.width,
                    height: el.height,
                    draggable: !readOnly && el.type !== ElementType.Shape, // Backgrounds not draggable usually
                    onClick: () => !readOnly && selectShape(el.id),
                    onTap: () => !readOnly && selectShape(el.id),
                    onDragEnd: (e: any) => {
                        if (onElementChange) {
                            onElementChange(slide.id, el.id, {
                                x: e.target.x(),
                                y: e.target.y()
                            });
                        }
                    },
                    onTransformEnd: (e: any) => {
                        if (onElementChange) {
                             const node = e.target;
                             const scaleX = node.scaleX();
                             const scaleY = node.scaleY();
                             // Reset scale to 1 and adjust width/height
                             node.scaleX(1);
                             node.scaleY(1);
                             onElementChange(slide.id, el.id, {
                                 x: node.x(),
                                 y: node.y(),
                                 width: Math.max(5, node.width() * scaleX),
                                 height: Math.max(5, node.height() * scaleY),
                                 rotation: node.rotation()
                             });
                        }
                    }
                };

                if (el.type === ElementType.Shape) {
                    return (
                        <Rect 
                            {...commonProps}
                            fill={el.style?.color || '#ffffff'}
                        />
                    );
                }

                if (el.type === ElementType.Image) {
                    return (
                        <URLImage 
                            src={el.content} 
                            {...commonProps}
                            cornerRadius={8}
                        />
                    );
                }

                if (el.type === ElementType.Text) {
                    return (
                        <Text
                            {...commonProps}
                            text={el.content}
                            fontFamily={el.style?.fontFamily}
                            fontSize={el.style?.fontSize}
                            fontStyle={el.style?.fontWeight?.toString()}
                            fill={el.style?.color}
                            align={el.style?.textAlign}
                            lineHeight={el.style?.lineHeight}
                            letterSpacing={el.style?.letterSpacing}
                            wrap="word"
                        />
                    );
                }
                return null;
            })}

            {!readOnly && selectedId && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        // Limit resize
                        if (newBox.width < 5 || newBox.height < 5) {
                            return oldBox;
                        }
                        return newBox;
                    }}
                    anchorSize={10}
                    borderStroke="#3b82f6"
                    anchorFill="#3b82f6"
                />
            )}
        </Layer>
      </Stage>
    </div>
  );
};
