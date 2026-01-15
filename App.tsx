import React, { useState } from 'react';
import { generatePresentationContent } from './services/geminiService';
import { Presentation } from './types';
import { Editor } from './components/Editor';

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    setError(null);
    try {
      const data = await generatePresentationContent(topic);
      setPresentation(data);
    } catch (err) {
      console.error(err);
      setError("Failed to generate presentation. Please check your API key and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (presentation) {
    return (
        <Editor 
            presentation={presentation} 
            onUpdatePresentation={setPresentation}
            onBack={() => setPresentation(null)}
        />
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="z-10 max-w-xl w-full px-6 text-center space-y-8">
        <div className="space-y-2">
            <h1 className="text-5xl font-bold tracking-tighter bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
                Lumina
            </h1>
            <p className="text-zinc-400 text-lg">
                Generative presentation design engine.
            </p>
        </div>

        <form onSubmit={handleGenerate} className="w-full space-y-4">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="What do you want to present about?"
                        className="w-full bg-zinc-900 border border-zinc-800 text-white px-6 py-5 rounded-lg text-lg placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all shadow-2xl"
                        disabled={isGenerating}
                    />
                    <div className="absolute right-3 top-3">
                         <kbd className="hidden sm:inline-block px-2 py-1.5 text-xs font-semibold text-zinc-500 bg-zinc-800 border border-zinc-700 rounded-md">
                            Enter
                        </kbd>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-200 text-sm">
                    {error}
                </div>
            )}
            
            <div className="flex justify-center gap-6 text-xs text-zinc-500 font-mono">
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    Golden Ratio
                </span>
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Rule of Thirds
                </span>
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Gemini 2.5
                </span>
            </div>
        </form>
      </div>

      {isGenerating && (
          <div className="absolute inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-6">
              <div className="relative w-24 h-24">
                  <div className="absolute inset-0 border-t-2 border-blue-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-3 border-r-2 border-purple-500 rounded-full animate-spin [animation-direction:reverse]"></div>
              </div>
              <div className="text-center space-y-2">
                  <h3 className="text-xl font-medium animate-pulse">Designing Structure...</h3>
                  <p className="text-zinc-500 text-sm">Calculaing layout coordinates & typographic hierarchy</p>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;
