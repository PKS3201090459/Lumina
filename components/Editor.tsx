import React, { useState } from 'react';
import { Presentation, Slide, SlideElement, CANVAS_WIDTH, CANVAS_HEIGHT } from '../types';
import { CanvasSlide } from './CanvasSlide';

interface EditorProps {
  presentation: Presentation;
  onUpdatePresentation: (p: Presentation) => void;
  onBack: () => void;
}

export const Editor: React.FC<EditorProps> = ({ presentation, onUpdatePresentation, onBack }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const currentSlide = presentation.slides[currentSlideIndex];

  const handleElementChange = (slideId: string, elementId: string, newAttrs: Partial<SlideElement>) => {
     const newSlides = presentation.slides.map(s => {
         if (s.id !== slideId) return s;
         return {
             ...s,
             elements: s.elements.map(e => e.id === elementId ? { ...e, ...newAttrs } : e)
         };
     });
     onUpdatePresentation({ ...presentation, slides: newSlides });
  };

  const downloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(presentation));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", presentation.title + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">
      
      {/* Sidebar - Thumbnails */}
      <div className="w-64 border-r border-zinc-800 flex flex-col bg-zinc-900">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
          <button onClick={onBack} className="text-zinc-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h1 className="font-bold text-sm truncate">{presentation.title}</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {presentation.slides.map((slide, idx) => (
                <div 
                    key={slide.id}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`cursor-pointer rounded-lg border-2 transition-all p-1 ${idx === currentSlideIndex ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-transparent hover:border-zinc-700'}`}
                >
                    <div className="aspect-video w-full bg-zinc-800 rounded overflow-hidden pointer-events-none relative">
                        {/* Mini Preview - scaled down significantly */}
                        <div className="absolute inset-0 flex items-center justify-center">
                           <span className="text-xs text-zinc-500">Slide {idx + 1}</span>
                        </div>
                        {/* Note: Rendering full canvas in thumbnail is expensive, usually just show an image or text for MVP */}
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 bg-zinc-950 relative flex flex-col">
        {/* Toolbar */}
        <div className="h-14 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-zinc-500">
                    {presentation.typography.headingFont} + {presentation.typography.bodyFont}
                </span>
                <div className="flex gap-2">
                    <div className="w-4 h-4 rounded-full" style={{background: presentation.palette.primary}}></div>
                    <div className="w-4 h-4 rounded-full" style={{background: presentation.palette.secondary}}></div>
                    <div className="w-4 h-4 rounded-full" style={{background: presentation.palette.accent}}></div>
                </div>
            </div>
            <div className="flex gap-2">
                 <button onClick={downloadJson} className="px-4 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors">
                    Export JSON
                 </button>
                 <button className="px-4 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors">
                    Present
                 </button>
            </div>
        </div>

        {/* Canvas Wrapper */}
        <div className="flex-1 flex items-center justify-center p-8 bg-zinc-950 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px]">
            <div className="relative shadow-2xl ring-1 ring-zinc-800">
                 <CanvasSlide 
                    slide={currentSlide}
                    scale={0.8} // Scale to fit screen
                    onElementChange={handleElementChange}
                 />
            </div>
        </div>
      </div>

      {/* Right Properties Panel */}
      <div className="w-72 border-l border-zinc-800 bg-zinc-900 p-6 hidden lg:block">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Design Logic</h3>
        
        <div className="space-y-6">
            <div>
                <label className="text-xs text-zinc-400 block mb-2">Layout Algorithm</label>
                <div className="p-2 bg-zinc-950 border border-zinc-800 rounded text-sm font-mono text-blue-400">
                    {currentSlide.layoutStrategy}
                </div>
                <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                    Elements are positioned using a generative coordinate system based on visual weight and the golden mean.
                </p>
            </div>

            <div>
                <label className="text-xs text-zinc-400 block mb-2">Slide Notes</label>
                <textarea 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-sm text-zinc-300 h-32 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                    value={currentSlide.notes || ''}
                    readOnly
                />
            </div>
        </div>
      </div>

    </div>
  );
};
