import React, { useState } from 'react';
import { X, Star, Award, CheckCircle2 } from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';
import { InterviewRecord } from '../../types';

interface InterviewEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: InterviewRecord;
}

export const InterviewEvaluationModal: React.FC<InterviewEvaluationModalProps> = ({
  isOpen,
  onClose,
  interview,
}) => {
  const { submitInterviewEvaluation } = useRecruitment();

  const [ratings, setRatings] = useState({
    communication: interview.evaluation?.communication || 4,
    confidence: interview.evaluation?.confidence || 4,
    experience: interview.evaluation?.experience || 3,
    jobKnowledge: interview.evaluation?.jobKnowledge || 4,
    stability: interview.evaluation?.stability || 4,
    salaryFit: interview.evaluation?.salaryFit || 4,
    attitude: interview.evaluation?.attitude || 5,
    overallSuitability: interview.evaluation?.overallSuitability || 4,
  });

  const [finalResult, setFinalResult] = useState<
    'Selected' | 'Rejected' | 'Hold' | 'Second Round' | 'Salary Discussion'
  >(interview.evaluation?.finalResult || 'Selected');

  const [remarks, setRemarks] = useState(
    interview.evaluation?.interviewerRemarks || 'Good technical understanding, articulate and ready to join immediately.'
  );

  if (!isOpen) return null;

  const criteriaKeys = [
    { key: 'communication', label: 'Communication' },
    { key: 'confidence', label: 'Confidence' },
    { key: 'experience', label: 'Experience' },
    { key: 'jobKnowledge', label: 'Job Knowledge' },
    { key: 'stability', label: 'Stability' },
    { key: 'salaryFit', label: 'Salary Fit' },
    { key: 'attitude', label: 'Attitude' },
    { key: 'overallSuitability', label: 'Overall Suitability' },
  ] as const;

  const totalScore = (Object.values(ratings) as number[]).reduce((a, b) => a + b, 0);
  const avgRating = Number((totalScore / 8).toFixed(1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    submitInterviewEvaluation(interview.id, {
      communication: ratings.communication,
      confidence: ratings.confidence,
      experience: ratings.experience,
      jobKnowledge: ratings.jobKnowledge,
      stability: ratings.stability,
      salaryFit: ratings.salaryFit,
      attitude: ratings.attitude,
      overallSuitability: ratings.overallSuitability,
      averageRating: avgRating,
      finalResult,
      interviewerRemarks: remarks,
      evaluatedAt: new Date().toISOString(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400" />
              Interview Evaluation & Scorecard
            </h2>
            <p className="text-xs text-slate-400">
              {interview.candidateName} • {interview.position} ({interview.candidateId})
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Average Rating Banner */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Composite Score</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-2xl font-black text-slate-900">{avgRating}</span>
                <span className="text-xs text-slate-500 font-semibold">/ 5.0</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Performance Tier</span>
              <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full font-bold text-xs ${
                avgRating >= 4 ? 'bg-emerald-100 text-emerald-800' : (avgRating >= 3 ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800')
              }`}>
                {avgRating >= 4 ? 'Top Candidate' : (avgRating >= 3 ? 'Acceptable' : 'Below Standard')}
              </span>
            </div>
          </div>

          {/* 1-5 Star Ratings for 8 Criteria */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Parameter Assessment (1 to 5 Rating)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {criteriaKeys.map((c) => (
                <div key={c.key} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-700">{c.label}</span>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatings({ ...ratings, [c.key]: star })}
                        className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs transition-colors ${
                          ratings[c.key] >= star
                            ? 'bg-amber-400 text-amber-950 shadow-xs'
                            : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                        }`}
                      >
                        {star}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Final Result Decision */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
              Final Decision Result <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { val: 'Selected', label: '✅ Selected', color: 'bg-emerald-600 text-white border-emerald-600' },
                { val: 'Rejected', label: '❌ Rejected', color: 'bg-rose-600 text-white border-rose-600' },
                { val: 'Hold', label: '⏸️ Hold', color: 'bg-amber-600 text-white border-amber-600' },
                { val: 'Second Round', label: '🔄 2nd Round', color: 'bg-indigo-600 text-white border-indigo-600' },
                { val: 'Salary Discussion', label: '💰 Salary Discussion', color: 'bg-blue-600 text-white border-blue-600' },
              ].map((item) => {
                const isSelected = finalResult === item.val;
                return (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setFinalResult(item.val as any)}
                    className={`p-2.5 rounded-lg border text-center font-bold transition-all ${
                      isSelected
                        ? `${item.color} shadow-xs`
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interviewer Remarks */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Interviewer Remarks & Strengths / Weaknesses <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Detailed feedback regarding candidate's technical skills, communication, and recommendation..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-white bg-blue-600 hover:bg-blue-700 font-bold rounded-lg shadow-xs"
            >
              Submit Evaluation & Update Pipeline
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
