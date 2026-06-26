import React, { useState } from 'react';
import { AnalysisType } from '../types';
import { Columns, Compass, BarChart3, Plus, X, Sparkles, Scale, Info } from 'lucide-react';

interface DecisionFormProps {
  onSubmit: (data: {
    title: string;
    context: string;
    analysisType: AnalysisType;
    options: string[];
  }) => void;
  isLoading: boolean;
}

export default function DecisionForm({ onSubmit, isLoading }: DecisionFormProps) {
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [analysisType, setAnalysisType] = useState<AnalysisType>('pros_cons');
  const [newOption, setNewOption] = useState('');
  const [options, setOptions] = useState<string[]>([]);

  const sampleIdeas = [
    {
      title: 'Should I move from California to Chicago?',
      type: 'pros_cons' as const,
      options: ['Move to Chicago', 'Stay in California'],
      context: 'I have a remote tech job making $120k. I am single, enjoy food and museums, but I hate freezing winters. Chicago is much cheaper.'
    },
    {
      title: 'Which cloud provider for my startup: AWS vs Supabase vs Vercel?',
      type: 'comparison' as const,
      options: ['AWS', 'Supabase', 'Vercel'],
      context: 'Building a real-time collaborative whiteboard SaaS. Small team of 2. We need rapid database setup, real-time sync, and quick global hosting.'
    },
    {
      title: 'Starting an independent coffee shop in my local suburban town',
      type: 'swot' as const,
      options: [],
      context: 'Local town has 15k population. There is only one Starbucks 3 miles away. I have $50,000 in personal savings. No previous retail experience.'
    }
  ];

  const handleAddOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddOption();
    }
  };

  const handleRemoveOption = (indexToRemove: number) => {
    setOptions(options.filter((_, index) => index !== indexToRemove));
  };

  const handleApplySample = (sample: typeof sampleIdeas[0]) => {
    setTitle(sample.title);
    setAnalysisType(sample.type);
    setContext(sample.context);
    setOptions(sample.options);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Validate and clean options
    let finalOptions = [...options];
    if (analysisType !== 'swot') {
      if (finalOptions.length === 0) {
        // Provide standard defaults if they left it empty
        finalOptions = ['Option A', 'Option B'];
      } else if (finalOptions.length === 1) {
        finalOptions.push('Do Nothing / Alternative');
      }
    } else {
      finalOptions = []; // SWOT is for single strategic choice
    }

    onSubmit({
      title: title.trim(),
      context: context.trim(),
      analysisType,
      options: finalOptions
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Intro Header */}
      <div className="mb-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 ring-8 ring-indigo-50">
          <Scale className="h-6 w-6" />
        </div>
        <h1 className="mt-6 font-sans text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Break Through Indecision
        </h1>
        <p className="mt-3 text-slate-500">
          State your dilemma, choose a framework, and let The Tiebreaker construct an analytical assessment to clarify your choices.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            What is the decision to make?
          </label>
          <input
            id="title"
            type="text"
            required
            disabled={isLoading}
            placeholder="e.g., Should I accept the senior developer offer in Seattle?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-slate-400 focus:ring-1 focus:ring-slate-400 disabled:opacity-50"
          />
        </div>

        {/* Framework Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Choose Analysis Framework
          </label>
          <div className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Pros & Cons card */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                setAnalysisType('pros_cons');
                if (options.length === 0) setOptions(['Option A', 'Option B']);
              }}
              className={`flex flex-col items-start rounded-xl border p-4 text-left transition-all cursor-pointer ${
                analysisType === 'pros_cons'
                  ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Columns className="h-4 w-4" />
              </div>
              <span className="mt-3 text-sm font-semibold text-slate-800">Pros & Cons</span>
              <span className="mt-1 text-[11px] text-slate-400 leading-normal">
                Compare side-by-side trade-offs with custom weighted scoring.
              </span>
            </button>

            {/* Comparison Table card */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                setAnalysisType('comparison');
                if (options.length === 0) setOptions(['React', 'Svelte']);
              }}
              className={`flex flex-col items-start rounded-xl border p-4 text-left transition-all cursor-pointer ${
                analysisType === 'comparison'
                  ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                <BarChart3 className="h-4 w-4" />
              </div>
              <span className="mt-3 text-sm font-semibold text-slate-800">Comparison Table</span>
              <span className="mt-1 text-[11px] text-slate-400 leading-normal">
                Score multiple options across customized weighted criteria.
              </span>
            </button>

            {/* SWOT analysis card */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                setAnalysisType('swot');
                setOptions([]);
              }}
              className={`flex flex-col items-start rounded-xl border p-4 text-left transition-all cursor-pointer ${
                analysisType === 'swot'
                  ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Compass className="h-4 w-4" />
              </div>
              <span className="mt-3 text-sm font-semibold text-slate-800">SWOT Analysis</span>
              <span className="mt-1 text-[11px] text-slate-400 leading-normal">
                Deconstruct strengths, risks, opportunities, and threats.
              </span>
            </button>
          </div>
        </div>

        {/* Dynamic Options Area (if not SWOT) */}
        {analysisType !== 'swot' && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Specify Options <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                disabled={isLoading}
                placeholder="e.g., Accept Seattle Offer"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-slate-400"
              />
              <button
                type="button"
                disabled={isLoading}
                onClick={handleAddOption}
                className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {/* Tags preview */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {options.map((opt, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 py-1 pl-3.5 pr-2 text-xs font-medium text-slate-700"
                >
                  {opt}
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleRemoveOption(i)}
                    className="rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {options.length === 0 && (
                <span className="text-xs text-slate-400 italic">
                  No custom options specified. We will compare &quot;Doing It&quot; vs &quot;Not Doing It&quot;.
                </span>
              )}
            </div>
          </div>
        )}

        {/* SWOT helpful banner */}
        {analysisType === 'swot' && (
          <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs text-amber-800 leading-normal">
                <strong>SWOT is ideal for evaluating a single comprehensive strategy</strong> (like launching a product, starting a venture, or making a massive pivot). We do not compare multiple distinct choices side-by-side; rather, we analyze the holistic integrity of a single decision path.
              </p>
            </div>
          </div>
        )}

        {/* Context / constraints */}
        <div>
          <label htmlFor="context" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Context, Priorities or Constraints <span className="text-slate-400 font-normal lowercase">(optional)</span>
          </label>
          <textarea
            id="context"
            rows={3}
            disabled={isLoading}
            placeholder="e.g., I have $30,000 saved. My major priority is long-term career growth, but I am worried about the rainy Seattle winters and leaving family."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-slate-400 focus:ring-1 focus:ring-slate-400 disabled:opacity-50"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading || !title.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 font-semibold text-white shadow-lg shadow-indigo-100 hover:shadow-xl hover:shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          <Sparkles className="h-4.5 w-4.5 text-amber-300 fill-amber-300" />
          <span>{isLoading ? 'The Tiebreaker is analyzing...' : 'Run Decision Analysis'}</span>
        </button>
      </form>

      {/* Suggestion Prompts */}
      <div className="mt-10">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Stuck? Spark an Idea
        </h3>
        <div className="mt-3 space-y-2.5">
          {sampleIdeas.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => handleApplySample(sample)}
              className="flex w-full items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 text-left transition-colors hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <span className="block text-xs font-medium text-slate-800">{sample.title}</span>
                <span className="mt-1 block text-[11px] text-slate-400 leading-normal line-clamp-1">
                  {sample.context}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
