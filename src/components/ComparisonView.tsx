import React, { useState } from 'react';
import { ComparisonResult, Criterion, OptionRating } from '../types';
import { Plus, Trash2, ArrowUpRight, Scale, Sparkles, HelpCircle } from 'lucide-react';

interface ComparisonViewProps {
  result: ComparisonResult;
  onChange: (updatedResult: ComparisonResult) => void;
}

export default function ComparisonView({ result, onChange }: ComparisonViewProps) {
  const [newCritName, setNewCritName] = useState('');
  const [newCritDesc, setNewCritDesc] = useState('');
  const [newCritWeight, setNewCritWeight] = useState(3);

  // Calculates the weighted score for an option
  // Score = sum of (rating * criterion_weight)
  const calculateOptionScore = (optionName: string) => {
    let totalScore = 0;
    let maxPossibleScore = 0;

    result.matrix.forEach((row) => {
      const criterion = result.criteria.find((c) => c.name === row.criterionName);
      if (!criterion) return;

      const ratingObj = row.ratings.find((r) => r.optionName === optionName);
      const ratingVal = ratingObj ? ratingObj.rating : 3;

      totalScore += ratingVal * criterion.weight;
      maxPossibleScore += 5 * criterion.weight;
    });

    return {
      total: totalScore,
      percentage: maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0
    };
  };

  const handleWeightChange = (critIdx: number, newWeight: number) => {
    const updatedCriteria = [...result.criteria];
    updatedCriteria[critIdx].weight = newWeight;
    onChange({
      ...result,
      criteria: updatedCriteria
    });
  };

  const handleRatingChange = (rowIndex: number, ratingIndex: number, newRating: number) => {
    const updatedMatrix = [...result.matrix];
    updatedMatrix[rowIndex].ratings[ratingIndex].rating = newRating;
    onChange({
      ...result,
      matrix: updatedMatrix
    });
  };

  const handleDeleteCriterion = (critName: string) => {
    const updatedCriteria = result.criteria.filter((c) => c.name !== critName);
    const updatedMatrix = result.matrix.filter((row) => row.criterionName !== critName);
    onChange({
      ...result,
      criteria: updatedCriteria,
      matrix: updatedMatrix
    });
  };

  const handleAddCriterion = () => {
    if (!newCritName.trim()) return;
    if (result.criteria.some((c) => c.name.toLowerCase() === newCritName.trim().toLowerCase())) return;

    const newCriterion: Criterion = {
      name: newCritName.trim(),
      description: newCritDesc.trim() || 'Custom comparison criteria.',
      weight: newCritWeight
    };

    // Create matrix ratings for all existing options
    const ratings: OptionRating[] = result.options.map((opt) => ({
      optionName: opt,
      rating: 3,
      explanation: 'Default initial rating.'
    }));

    const newMatrixRow = {
      criterionName: newCritName.trim(),
      ratings
    };

    setNewCritName('');
    setNewCritDesc('');
    setNewCritWeight(3);

    onChange({
      ...result,
      criteria: [...result.criteria, newCriterion],
      matrix: [...result.matrix, newMatrixRow]
    });
  };

  // Find the winning option based on highest score percentage
  const scores = result.options.map((opt) => ({
    name: opt,
    score: calculateOptionScore(opt)
  }));
  const maxScore = Math.max(...scores.map((s) => s.score.total));
  const leadingOptions = scores.filter((s) => s.score.total === maxScore).map((s) => s.name);

  return (
    <div className="space-y-8">
      {/* Comparison Scorecards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {scores.map((s, idx) => {
          const isWinner = leadingOptions.includes(s.name);
          return (
            <div
              key={idx}
              className={`rounded-xl border p-4 transition-all ${
                isWinner
                  ? 'border-sky-200 bg-sky-50/15 ring-1 ring-sky-500/10'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Option {idx + 1}
                </span>
                {isWinner && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-2 py-0.5 text-[9px] font-bold text-sky-700">
                    <Scale className="h-2.5 w-2.5" /> High Score
                  </span>
                )}
              </div>
              <h4 className="mt-2 text-base font-bold text-slate-800 line-clamp-1">{s.name}</h4>
              <div className="mt-3 flex items-baseline gap-2">
                <span className={`text-2xl font-black ${isWinner ? 'text-sky-600' : 'text-slate-600'}`}>
                  {s.score.total} pts
                </span>
                <span className="text-xs font-semibold text-slate-400">({s.score.percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Interactive Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[650px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500">
              <th className="p-4 font-semibold text-slate-600 min-w-[200px]">Criteria & Importance</th>
              {result.options.map((opt, idx) => (
                <th key={idx} className="p-4 font-bold text-slate-800 min-w-[180px]">
                  Option: {opt}
                </th>
              ))}
              <th className="p-4 text-center w-12" aria-label="Actions" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {result.matrix.map((row, rowIdx) => {
              const criterion = result.criteria.find((c) => c.name === row.criterionName);
              if (!criterion) return null;

              return (
                <tr key={rowIdx} className="group hover:bg-slate-50/30 transition-colors">
                  {/* Criterion Title & Weight Controller */}
                  <td className="p-4">
                    <div>
                      <span className="font-semibold text-slate-800">{criterion.name}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">{criterion.description}</p>
                    </div>

                    {/* Weight Controller */}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weight:</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((wVal) => (
                          <button
                            key={wVal}
                            onClick={() => handleWeightChange(result.criteria.indexOf(criterion), wVal)}
                            className={`h-2.5 w-2.5 rounded-full transition-colors cursor-pointer ${
                              wVal <= criterion.weight ? 'bg-indigo-600' : 'bg-slate-200'
                            }`}
                            title={`Importance Weight: ${wVal}`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-black text-indigo-600">{criterion.weight}</span>
                    </div>
                  </td>

                  {/* Options Scores and Explanations */}
                  {row.ratings.map((ratingObj, ratingIdx) => (
                    <td key={ratingIdx} className="p-4 align-top">
                      <div className="flex flex-col gap-2">
                        {/* Star Rating selector */}
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleRatingChange(rowIdx, ratingIdx, star)}
                              className={`h-5 w-5 text-sm transition-all cursor-pointer ${
                                star <= ratingObj.rating
                                  ? 'text-amber-400 hover:text-amber-500 scale-105'
                                  : 'text-slate-200 hover:text-slate-300'
                              }`}
                            >
                              ★
                            </button>
                          ))}
                          <span className="ml-1 text-xs font-bold text-slate-600">
                            {ratingObj.rating}/5
                          </span>
                        </div>

                        {/* Explanation text */}
                        <p className="text-xs text-slate-500 leading-normal">{ratingObj.explanation}</p>
                      </div>
                    </td>
                  ))}

                  {/* Actions Column */}
                  <td className="p-4 text-center align-middle">
                    <button
                      onClick={() => handleDeleteCriterion(criterion.name)}
                      className="rounded p-1 text-slate-300 hover:bg-slate-100 hover:text-rose-600 focus:opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove Criterion"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}

            {/* Overall Weighted Score Footer Row */}
            <tr className="border-t-2 border-slate-200 bg-slate-50/50 font-semibold text-slate-900">
              <td className="p-4">
                <span className="text-sm font-black uppercase tracking-wider text-slate-700">Total Weighted Score</span>
                <p className="text-[10px] text-slate-400 font-normal mt-0.5">Sum of (Score &times; Weight)</p>
              </td>
              {result.options.map((opt, idx) => {
                const s = calculateOptionScore(opt);
                return (
                  <td key={idx} className="p-4 align-middle">
                    <span className="text-xl font-extrabold text-slate-800">{s.total} points</span>
                    <span className="ml-1.5 text-xs text-slate-400 font-medium">({s.percentage}%)</span>
                  </td>
                );
              })}
              <td className="p-4" />
            </tr>
          </tbody>
        </table>
      </div>

      {/* Add Custom Criterion Block */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/30 p-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">Add Custom Criterion</h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 items-center">
          <div className="sm:col-span-4">
            <input
              type="text"
              placeholder="Criterion Name (e.g., Timeline)"
              value={newCritName}
              onChange={(e) => setNewCritName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-slate-400"
            />
          </div>
          <div className="sm:col-span-5">
            <input
              type="text"
              placeholder="Description (e.g., Speed of implementation)"
              value={newCritDesc}
              onChange={(e) => setNewCritDesc(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-slate-400"
            />
          </div>
          <div className="sm:col-span-2">
            <select
              value={newCritWeight}
              onChange={(e) => setNewCritWeight(parseInt(e.target.value))}
              className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-slate-600 outline-none focus:border-slate-400"
            >
              <option value="1">Weight: 1 (Low)</option>
              <option value="2">Weight: 2</option>
              <option value="3">Weight: 3 (Medium)</option>
              <option value="4">Weight: 4</option>
              <option value="5">Weight: 5 (High)</option>
            </select>
          </div>
          <div className="sm:col-span-1">
            <button
              onClick={handleAddCriterion}
              className="flex w-full items-center justify-center rounded-lg bg-indigo-600 text-white transition-colors hover:bg-indigo-700 py-2 cursor-pointer"
              title="Add criterion"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
