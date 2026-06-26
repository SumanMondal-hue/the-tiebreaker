import React, { useState } from 'react';
import { ProsConsResult, OptionProsCons, ProConItem } from '../types';
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, Scale, Activity } from 'lucide-react';

interface ProsConsViewProps {
  result: ProsConsResult;
  onChange: (updatedResult: ProsConsResult) => void;
}

export default function ProsConsView({ result, onChange }: ProsConsViewProps) {
  const [newFactorText, setNewFactorText] = useState<{ [key: string]: string }>({});
  const [newFactorType, setNewFactorType] = useState<{ [key: string]: 'pro' | 'con' }>({});
  const [newFactorCategory, setNewFactorCategory] = useState<{ [key: string]: string }>({});
  const [newFactorWeight, setNewFactorWeight] = useState<{ [key: string]: number }>({});

  const calculateOptionScore = (option: OptionProsCons) => {
    const prosSum = option.pros.reduce((sum, item) => sum + item.weight, 0);
    const consSum = option.cons.reduce((sum, item) => sum + item.weight, 0);
    return prosSum - consSum;
  };

  const handleWeightChange = (optionIdx: number, type: 'pros' | 'cons', itemIdx: number, newWeight: number) => {
    const updatedAnalysis = [...result.optionsAnalysis];
    updatedAnalysis[optionIdx][type][itemIdx].weight = newWeight;

    // Recalculate options scores if desired or trigger parent update
    onChange({
      ...result,
      optionsAnalysis: updatedAnalysis
    });
  };

  const handleDeleteFactor = (optionIdx: number, type: 'pros' | 'cons', itemIdx: number) => {
    const updatedAnalysis = [...result.optionsAnalysis];
    updatedAnalysis[optionIdx][type] = updatedAnalysis[optionIdx][type].filter((_, idx) => idx !== itemIdx);

    onChange({
      ...result,
      optionsAnalysis: updatedAnalysis
    });
  };

  const handleAddFactor = (optionIdx: number, type: 'pro' | 'con') => {
    const option = result.optionsAnalysis[optionIdx];
    const textKey = `${optionIdx}_${type}`;
    const text = newFactorText[textKey]?.trim();
    if (!text) return;

    const weight = newFactorWeight[textKey] || 3;
    const category = newFactorCategory[textKey]?.trim() || 'General';

    const newItem: ProConItem = {
      id: `${type}_custom_${Date.now()}`,
      text,
      category,
      weight,
      explanation: 'Manually added custom factor.'
    };

    const updatedAnalysis = [...result.optionsAnalysis];
    if (type === 'pro') {
      updatedAnalysis[optionIdx].pros.push(newItem);
    } else {
      updatedAnalysis[optionIdx].cons.push(newItem);
    }

    // Reset inputs
    setNewFactorText({ ...newFactorText, [textKey]: '' });
    setNewFactorCategory({ ...newFactorCategory, [textKey]: '' });
    setNewFactorWeight({ ...newFactorWeight, [textKey]: 3 });

    onChange({
      ...result,
      optionsAnalysis: updatedAnalysis
    });
  };

  return (
    <div className="space-y-8">
      {/* Visual Balance Card */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {result.optionsAnalysis.map((option, idx) => {
          const score = calculateOptionScore(option);
          const isWinner = score === Math.max(...result.optionsAnalysis.map(calculateOptionScore));
          return (
            <div
              key={idx}
              className={`rounded-xl border p-4 transition-all ${
                isWinner
                  ? 'border-emerald-200 bg-emerald-50/20 ring-1 ring-emerald-500/10'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Option {idx + 1}
                </span>
                {isWinner && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    <Scale className="h-3 w-3" /> Leading Path
                  </span>
                )}
              </div>
              <h3 className="mt-2 text-lg font-bold text-slate-900">{option.optionName}</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className={`text-3xl font-black ${score > 0 ? 'text-emerald-600' : score < 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                  {score > 0 ? `+${score}` : score}
                </span>
                <span className="text-xs font-medium text-slate-400">weighted balance score</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Options Columns Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {result.optionsAnalysis.map((option, optIdx) => {
          const score = calculateOptionScore(option);

          return (
            <div key={optIdx} className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900 leading-snug">{option.optionName}</h3>
                  <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ${
                    score > 0 ? 'bg-emerald-50 text-emerald-700' : score < 0 ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-slate-700'
                  }`}>
                    Net Score: {score > 0 ? `+${score}` : score}
                  </span>
                </div>
              </div>

              {/* Pros List */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between bg-emerald-50/60 border border-emerald-100 rounded-xl px-3 py-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
                    <ArrowUpRight className="h-4 w-4" /> Pros (+ Benefit)
                  </span>
                  <span className="text-[10px] text-emerald-600/80 font-medium tracking-wide">Adjust weights below</span>
                </div>

                <div className="space-y-2.5">
                  {option.pros.map((pro, itemIdx) => (
                    <div key={pro.id} className="group relative rounded-xl border border-emerald-100/60 bg-emerald-50/10 p-3.5 pr-8 transition-colors hover:bg-emerald-50/20">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-sm font-semibold text-slate-800 leading-tight">{pro.text}</span>
                            <span className="inline-flex rounded-md bg-emerald-100/50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
                              {pro.category}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500 leading-relaxed">{pro.explanation}</p>
                        </div>

                        {/* Interactive Weight Selector Badge */}
                        <div className="flex shrink-0 flex-col items-center gap-1">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => handleWeightChange(optIdx, 'pros', itemIdx, star)}
                                className={`h-2 w-2 rounded-full transition-all cursor-pointer ${
                                  star <= pro.weight ? 'bg-emerald-500' : 'bg-slate-200'
                                }`}
                                title={`Set weight to ${star}`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-emerald-600">
                            W: {pro.weight}
                          </span>
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteFactor(optIdx, 'pros', itemIdx)}
                        className="absolute right-2.5 top-3.5 rounded p-1 text-slate-300 hover:bg-emerald-100/40 hover:text-rose-600 md:opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove Factor"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Add Custom Pro Input */}
                  <div className="rounded-xl border border-dashed border-slate-200 p-3 bg-slate-50/20">
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12">
                      <input
                        type="text"
                        placeholder="Add dynamic custom pro..."
                        value={newFactorText[`${optIdx}_pro`] || ''}
                        onChange={(e) => setNewFactorText({ ...newFactorText, [`${optIdx}_pro`]: e.target.value })}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-400 sm:col-span-6"
                      />
                      <input
                        type="text"
                        placeholder="Category (e.g., Cost)"
                        value={newFactorCategory[`${optIdx}_pro`] || ''}
                        onChange={(e) => setNewFactorCategory({ ...newFactorCategory, [`${optIdx}_pro`]: e.target.value })}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-400 sm:col-span-3"
                      />
                      <select
                        value={newFactorWeight[`${optIdx}_pro`] || 3}
                        onChange={(e) => setNewFactorWeight({ ...newFactorWeight, [`${optIdx}_pro`]: parseInt(e.target.value) })}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600 outline-none focus:border-slate-400 sm:col-span-2"
                      >
                        <option value="1">W: 1</option>
                        <option value="2">W: 2</option>
                        <option value="3">W: 3</option>
                        <option value="4">W: 4</option>
                        <option value="5">W: 5</option>
                      </select>
                      <button
                        onClick={() => handleAddFactor(optIdx, 'pro')}
                        className="flex items-center justify-center rounded-lg bg-indigo-600 text-white transition-colors hover:bg-indigo-700 py-1.5 cursor-pointer sm:col-span-1"
                        title="Add pro factor"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cons List */}
              <div className="space-y-3.5 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between bg-rose-50/60 border border-rose-100 rounded-xl px-3 py-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-700">
                    <ArrowDownRight className="h-4 w-4" /> Cons (- Disadvantage / Risk)
                  </span>
                  <span className="text-[10px] text-rose-600/80 font-medium tracking-wide">Adjust weights below</span>
                </div>

                <div className="space-y-2.5">
                  {option.cons.map((con, itemIdx) => (
                    <div key={con.id} className="group relative rounded-xl border border-rose-100/60 bg-rose-50/10 p-3.5 pr-8 transition-colors hover:bg-rose-50/20">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-sm font-semibold text-slate-800 leading-tight">{con.text}</span>
                            <span className="inline-flex rounded-md bg-rose-100/50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-rose-700">
                              {con.category}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500 leading-relaxed">{con.explanation}</p>
                        </div>

                        {/* Interactive Weight Selector Badge */}
                        <div className="flex shrink-0 flex-col items-center gap-1">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => handleWeightChange(optIdx, 'cons', itemIdx, star)}
                                className={`h-2 w-2 rounded-full transition-all cursor-pointer ${
                                  star <= con.weight ? 'bg-rose-500' : 'bg-slate-200'
                                }`}
                                title={`Set weight to ${star}`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-rose-600">
                            W: {con.weight}
                          </span>
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteFactor(optIdx, 'cons', itemIdx)}
                        className="absolute right-2.5 top-3.5 rounded p-1 text-slate-300 hover:bg-rose-100/40 hover:text-rose-600 md:opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove Factor"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Add Custom Con Input */}
                  <div className="rounded-xl border border-dashed border-slate-200 p-3 bg-slate-50/20">
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12">
                      <input
                        type="text"
                        placeholder="Add dynamic custom con..."
                        value={newFactorText[`${optIdx}_con`] || ''}
                        onChange={(e) => setNewFactorText({ ...newFactorText, [`${optIdx}_con`]: e.target.value })}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-400 sm:col-span-6"
                      />
                      <input
                        type="text"
                        placeholder="Category (e.g., Risk)"
                        value={newFactorCategory[`${optIdx}_con`] || ''}
                        onChange={(e) => setNewFactorCategory({ ...newFactorCategory, [`${optIdx}_con`]: e.target.value })}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-400 sm:col-span-3"
                      />
                      <select
                        value={newFactorWeight[`${optIdx}_con`] || 3}
                        onChange={(e) => setNewFactorWeight({ ...newFactorWeight, [`${optIdx}_con`]: parseInt(e.target.value) })}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600 outline-none focus:border-slate-400 sm:col-span-2"
                      >
                        <option value="1">W: 1</option>
                        <option value="2">W: 2</option>
                        <option value="3">W: 3</option>
                        <option value="4">W: 4</option>
                        <option value="5">W: 5</option>
                      </select>
                      <button
                        onClick={() => handleAddFactor(optIdx, 'con')}
                        className="flex items-center justify-center rounded-lg bg-indigo-600 text-white transition-colors hover:bg-indigo-700 py-1.5 cursor-pointer sm:col-span-1"
                        title="Add con factor"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
