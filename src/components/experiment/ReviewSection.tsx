"use client";

import React, { useState } from "react";
import { ExperimentMetadata } from "@/types/experiment";

interface ReviewSectionProps {
  experiment: ExperimentMetadata;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ experiment }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const score = experiment.quiz.reduce((acc, q) => {
    return selectedAnswers[q.id] === q.correctIndex ? acc + q.marks : acc;
  }, 0);

  const totalPossible = experiment.quiz.reduce((acc, q) => acc + q.marks, 0);

  return (
    <div className="flex flex-col gap-6 text-slate-100">
      {/* Syllabus Evaluation Pattern & Rubric (Manual Page 2) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
            VIT CHENNAI BCHY101P ASSESSMENT RUBRIC
          </span>
          <span className="text-xs font-mono text-slate-400">Manual Page 2</span>
        </div>

        <h3 className="text-base font-bold text-slate-100">
          Grading Standards for Laboratory Assessment (Fall Semester)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h4 className="font-bold text-cyan-300 mb-2">TITRATION EXPERIMENTS (Skill: 6M, Pres: 4M)</h4>
            <div className="space-y-1 text-slate-300">
              <div className="flex justify-between"><span>Error 0–2%:</span><strong className="text-emerald-400">10 Marks</strong></div>
              <div className="flex justify-between"><span>Error &gt;2–3%:</span><strong className="text-emerald-400">9 Marks</strong></div>
              <div className="flex justify-between"><span>Error &gt;3–4%:</span><strong className="text-amber-400">8 Marks</strong></div>
              <div className="flex justify-between"><span>Error &gt;4%:</span><strong className="text-rose-400">5 Marks</strong></div>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h4 className="font-bold text-cyan-300 mb-2">INSTRUMENT EXPERIMENTS (Skill: 6M, Pres: 4M)</h4>
            <div className="space-y-1 text-slate-300">
              <div className="flex justify-between"><span>Error 0–3%:</span><strong className="text-emerald-400">10 Marks</strong></div>
              <div className="flex justify-between"><span>Error &gt;3–4%:</span><strong className="text-emerald-400">9 Marks</strong></div>
              <div className="flex justify-between"><span>Error &gt;4–5%:</span><strong className="text-amber-400">8 Marks</strong></div>
              <div className="flex justify-between"><span>Error &gt;5%:</span><strong className="text-rose-400">5 Marks</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* Formative Concept Assessment Quiz */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Formative Concept Quiz (BCHY101P Syllabi Pattern)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Answer the following concept and calculation questions to test your laboratory readiness.
            </p>
          </div>

          {isSubmitted && (
            <div className="px-3 py-1.5 bg-cyan-950 border border-cyan-800 rounded-lg text-xs font-mono font-bold text-cyan-300">
              Score: {score} / {totalPossible} Marks
            </div>
          )}
        </div>

        {experiment.quiz.length === 0 ? (
          <p className="text-xs font-mono text-slate-500 py-4">
            Quiz questions for this experiment are scheduled for inclusion in Phase 2 / Phase 3.
          </p>
        ) : (
          <div className="space-y-6">
            {experiment.quiz.map((q, qIdx) => {
              const selected = selectedAnswers[q.id];
              return (
                <div key={q.id} className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      Q{qIdx + 1}. {q.question}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {q.marks} Mark
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selected === optIdx;
                      const isCorrect = optIdx === q.correctIndex;

                      let btnStyle = "bg-slate-900/90 hover:bg-slate-850 border-slate-800 text-slate-300";
                      if (isSubmitted) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-950/80 border-emerald-600 text-emerald-200 font-semibold";
                        } else if (isSelected && !isCorrect) {
                          btnStyle = "bg-rose-950/80 border-rose-700 text-rose-300";
                        }
                      } else if (isSelected) {
                        btnStyle = "bg-cyan-950/80 border-cyan-600 text-cyan-200 font-semibold";
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={isSubmitted}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`p-3 rounded-lg border text-left text-xs font-sans transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {isSubmitted && isCorrect && <span className="text-emerald-400 font-mono text-xs">✓ Correct</span>}
                          {isSubmitted && isSelected && !isCorrect && <span className="text-rose-400 font-mono text-xs">✗ Incorrect</span>}
                        </button>
                      );
                    })}
                  </div>

                  {isSubmitted && (
                    <div className="mt-2 p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs font-sans text-slate-300 leading-relaxed">
                      <strong className="text-cyan-400 font-mono text-[11px] block mb-0.5">EXPLANATION:</strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}

            {!isSubmitted && (
              <button
                onClick={() => setIsSubmitted(true)}
                disabled={Object.keys(selectedAnswers).length < experiment.quiz.length}
                className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg text-xs font-mono font-bold shadow-lg transition-all w-fit"
              >
                Submit Answers & Review Explanations
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
