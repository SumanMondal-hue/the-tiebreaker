import React, { useState, useEffect } from 'react';
import { Decision, AnalysisType } from './types';
import { mockDecisions } from './mockData';
import HistorySidebar from './components/HistorySidebar';
import DecisionForm from './components/DecisionForm';
import VerdictBanner from './components/VerdictBanner';
import ProsConsView from './components/ProsConsView';
import SwotView from './components/SwotView';
import ComparisonView from './components/ComparisonView';
import { Menu, Plus, RefreshCw, Copy, Check, Scale, BookOpen, AlertCircle, Trash2 } from 'lucide-react';

export default function App() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [activeDecisionId, setActiveDecisionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  // Reassuring processing step indicators during AI load
  const [generationStep, setGenerationStep] = useState('');

  // Initial load from localStorage, falling back to mock decisions
  useEffect(() => {
    const saved = localStorage.getItem('tiebreaker_decisions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDecisions(parsed);
          setActiveDecisionId(parsed[0].id);
          return;
        }
      } catch (e) {
        console.error('Failed to parse saved decisions:', e);
      }
    }
    // Fallback to pre-populated mock data
    setDecisions(mockDecisions);
    setActiveDecisionId(mockDecisions[0].id);
  }, []);

  // Save changes to localStorage whenever decisions change
  const saveDecisions = (updatedDecisions: Decision[]) => {
    setDecisions(updatedDecisions);
    localStorage.setItem('tiebreaker_decisions', JSON.stringify(updatedDecisions));
  };

  const handleSelectDecision = (id: string | null) => {
    setActiveDecisionId(id);
    setError(null);
  };

  const handleDeleteDecision = (id: string) => {
    const updated = decisions.filter((d) => d.id !== id);
    saveDecisions(updated);

    if (activeDecisionId === id) {
      if (updated.length > 0) {
        setActiveDecisionId(updated[0].id);
      } else {
        setActiveDecisionId(null);
      }
    }
  };

  const handleStartNew = () => {
    setActiveDecisionId(null);
    setError(null);
  };

  // Helper to change current active decision result (updating manual ratings/weights)
  const handleDecisionResultChange = (updatedResult: any) => {
    if (!activeDecisionId) return;

    const updatedDecisions = decisions.map((d) => {
      if (d.id === activeDecisionId) {
        // We can also re-evaluate recommendation logic locally or just preserve the updated items
        return {
          ...d,
          result: updatedResult
        };
      }
      return d;
    });

    saveDecisions(updatedDecisions);
  };

  const handleFormSubmit = async (formData: {
    title: string;
    context: string;
    analysisType: AnalysisType;
    options: string[];
  }) => {
    setIsLoading(true);
    setError(null);

    // Simulate procedural analysis steps
    const steps = [
      'Gleaning evaluation criteria...',
      'Deconstructing trade-off variables...',
      'Computing weighted impact scores...',
      'Formulating ultimate Tiebreaker Verdict...'
    ];

    let currentStep = 0;
    setGenerationStep(steps[currentStep]);

    const stepInterval = setInterval(() => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        setGenerationStep(steps[currentStep]);
      }
    }, 1500);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Server returned an error during analysis.');
      }

      const analysisResult = await response.json();

      const newDecision: Decision = {
        id: `dec_${Date.now()}`,
        title: formData.title,
        context: formData.context,
        createdAt: new Date().toISOString(),
        analysisType: formData.analysisType,
        options: formData.options,
        result: analysisResult
      };

      const updatedDecisions = [newDecision, ...decisions];
      saveDecisions(updatedDecisions);
      setActiveDecisionId(newDecision.id);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while generating analysis.');
    } finally {
      clearInterval(stepInterval);
      setIsLoading(false);
    }
  };

  const activeDecision = decisions.find((d) => d.id === activeDecisionId) || null;

  // Render correct framework view
  const renderFrameworkView = () => {
    if (!activeDecision) return null;

    switch (activeDecision.analysisType) {
      case 'pros_cons':
        return (
          <ProsConsView
            result={activeDecision.result as any}
            onChange={handleDecisionResultChange}
          />
        );
      case 'swot':
        return (
          <SwotView
            result={activeDecision.result as any}
            onChange={handleDecisionResultChange}
          />
        );
      case 'comparison':
        return (
          <ComparisonView
            result={activeDecision.result as any}
            onChange={handleDecisionResultChange}
          />
        );
      default:
        return null;
    }
  };

  const handleCopySummary = () => {
    if (!activeDecision) return;

    let text = `### Decision Analysis: ${activeDecision.title}\n`;
    if (activeDecision.context) {
      text += `**Context:** ${activeDecision.context}\n\n`;
    }

    const res = activeDecision.result;
    text += `### The Tiebreaker's Verdict:\n`;
    text += `**Recommendation:** ${res.verdict.recommendation}\n`;
    text += `**Summary:** ${res.verdict.summary}\n\n`;

    if (activeDecision.analysisType === 'pros_cons') {
      const pc = res as any;
      pc.optionsAnalysis.forEach((opt: any) => {
        text += `#### Option: ${opt.optionName}\n`;
        text += `**Pros:**\n`;
        opt.pros.forEach((p: any) => {
          text += `- ${p.text} (Weight: ${p.weight}/5) - ${p.explanation}\n`;
        });
        text += `**Cons:**\n`;
        opt.cons.forEach((c: any) => {
          text += `- ${c.text} (Weight: ${c.weight}/5) - ${c.explanation}\n`;
        });
        text += `\n`;
      });
    } else if (activeDecision.analysisType === 'swot') {
      const swot = res as any;
      text += `#### SWOT Matrix:\n`;
      text += `**Strengths:**\n`;
      swot.strengths.forEach((s: any) => text += `- ${s.text} (Impact: ${s.impact}/5) - ${s.explanation}\n`);
      text += `**Weaknesses:**\n`;
      swot.weaknesses.forEach((w: any) => text += `- ${w.text} (Impact: ${w.impact}/5) - ${w.explanation}\n`);
      text += `**Opportunities:**\n`;
      swot.opportunities.forEach((o: any) => text += `- ${o.text} (Impact: ${o.impact}/5) - ${o.explanation}\n`);
      text += `**Threats:**\n`;
      swot.threats.forEach((t: any) => text += `- ${t.text} (Impact: ${t.impact}/5) - ${t.explanation}\n`);
    } else if (activeDecision.analysisType === 'comparison') {
      const comp = res as any;
      text += `#### Comparison Grid:\n`;
      comp.matrix.forEach((row: any) => {
        text += `- **Criterion: ${row.criterionName}**\n`;
        row.ratings.forEach((r: any) => {
          text += `  - ${r.optionName}: Rating ${r.rating}/5 - ${r.explanation}\n`;
        });
      });
    }

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800">
      {/* Historical Sidebar Navigation */}
      <HistorySidebar
        decisions={decisions}
        activeDecisionId={activeDecisionId}
        onSelectDecision={handleSelectDecision}
        onDeleteDecision={handleDeleteDecision}
        onStartNew={handleStartNew}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content Pane */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar controls */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 focus:outline-none"
              title="Toggle Sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            {activeDecision && (
              <h2 className="hidden max-w-md truncate text-sm font-semibold text-slate-800 sm:block">
                {activeDecision.title}
              </h2>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeDecision && (
              <>
                <button
                  onClick={handleCopySummary}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Summary'}</span>
                </button>

                <button
                  onClick={() => handleDeleteDecision(activeDecision.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-100 bg-rose-50/50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100/60 cursor-pointer"
                  title="Delete decision"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </>
            )}

            <button
              onClick={handleStartNew}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-indigo-100 transition-colors hover:bg-indigo-700 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Analysis</span>
            </button>
          </div>
        </header>

        {/* Content canvas container */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          {error && (
            <div className="mx-auto max-w-3xl px-4 pt-6">
              <div className="flex items-start gap-3 rounded-xl border border-rose-100 bg-rose-50 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                <div>
                  <h3 className="text-sm font-bold text-rose-800">Generation Failed</h3>
                  <p className="mt-1 text-xs text-rose-700 leading-normal">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="mt-2.5 text-xs font-semibold text-rose-800 underline hover:text-rose-950"
                  >
                    Dismiss error
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* LOADING SCREEN */}
          {isLoading ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <div className="relative flex h-14 w-14 items-center justify-center">
                {/* Visual scale swinging loading animation */}
                <div className="absolute inset-0 rounded-full border-2 border-slate-100" />
                <div className="absolute inset-0 rounded-full border-t-2 border-indigo-600 animate-spin" />
                <Scale className="h-5 w-5 text-indigo-600 animate-pulse" />
              </div>

              <h3 className="mt-6 font-sans text-base font-bold text-slate-900">
                Evaluating Dilemma Variables
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Please wait while we consult strategic frameworks...
              </p>

              {/* simulated procedural indicator with background card */}
              <div className="mt-6 flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-4 py-2 text-xs font-medium text-slate-500 shadow-sm">
                <RefreshCw className="h-3 w-3 animate-spin text-slate-400" />
                <span>{generationStep}</span>
              </div>
            </div>
          ) : activeDecision ? (
            /* DECISION REPORT DISPLAY */
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
              {/* Decision Metadata block */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Decision Context</span>
                <h1 className="font-sans text-2xl font-black text-slate-900 tracking-tight leading-snug sm:text-3xl">
                  {activeDecision.title}
                </h1>
                {activeDecision.context && (
                  <p className="mt-1 text-sm text-slate-500 leading-relaxed max-w-3xl">
                    &ldquo;{activeDecision.context}&rdquo;
                  </p>
                )}
              </div>

              {/* The Verdict Banner */}
              <VerdictBanner
                recommendation={activeDecision.result.verdict.recommendation}
                summary={activeDecision.result.verdict.summary}
                confidenceScore={(activeDecision.result as any).verdict.confidenceScore}
                keyActionableTakeaway={(activeDecision.result as any).verdict.keyActionableTakeaway}
                directComparisonSummary={(activeDecision.result as any).verdict.directComparisonSummary}
              />

              {/* Framework interactive elements */}
              {renderFrameworkView()}
            </div>
          ) : (
            /* INITIAL FORM FOR CREATING AN ENTRY */
            <DecisionForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          )}
        </main>
      </div>
    </div>
  );
}
