import React, { useState } from 'react';
import { Briefcase, Plus, MapPin, Users, CheckCircle, Clock } from 'lucide-react';
import { Department } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface JobOpening {
  id: string;
  title: string;
  department: Department;
  openings: number;
  filled: number;
  experienceRequired: string;
  salaryRange: string;
  location: string;
  status: 'Open' | 'Urgent' | 'Closed';
}

const INITIAL_JOBS: JobOpening[] = [
  {
    id: 'JOB-01',
    title: 'Senior HR Recruiter',
    department: 'HR Recruitment',
    openings: 5,
    filled: 3,
    experienceRequired: '2-4 Years',
    salaryRange: '₹25,000 - ₹35,000',
    location: 'Sector 62, Noida',
    status: 'Urgent',
  },
  {
    id: 'JOB-02',
    title: 'Telecalling Sales Executive',
    department: 'BKD Recruitment',
    openings: 15,
    filled: 7,
    experienceRequired: '1-3 Years',
    salaryRange: '₹18,000 - ₹26,000',
    location: 'Sector 62, Noida',
    status: 'Open',
  },
  {
    id: 'JOB-03',
    title: 'Customer Success Specialist',
    department: 'HR Recruitment',
    openings: 8,
    filled: 5,
    experienceRequired: '1-2 Years',
    salaryRange: '₹22,000 - ₹28,000',
    location: 'Noida Office',
    status: 'Open',
  },
  {
    id: 'JOB-04',
    title: 'Operations Team Lead',
    department: 'BKD Recruitment',
    openings: 2,
    filled: 2,
    experienceRequired: '3-5 Years',
    salaryRange: '₹35,000 - ₹45,000',
    location: 'Sector 62, Noida',
    status: 'Closed',
  },
];

export const JobOpeningsPanel: React.FC = () => {
  const [jobs, setJobs] = useState<JobOpening[]>(INITIAL_JOBS);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    department: 'HR Recruitment' as Department,
    openings: 5,
    experienceRequired: '1-3 Years',
    salaryRange: '₹20,000 - ₹30,000',
    location: 'Sector 62, Noida',
    status: 'Open' as 'Open' | 'Urgent' | 'Closed',
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    const newJob: JobOpening = {
      id: `JOB-${String(jobs.length + 1).padStart(2, '0')}`,
      title: formData.title,
      department: formData.department,
      openings: Number(formData.openings),
      filled: 0,
      experienceRequired: formData.experienceRequired,
      salaryRange: formData.salaryRange,
      location: formData.location,
      status: formData.status,
    };
    setJobs([newJob, ...jobs]);
    setIsAdding(false);
    setFormData({
      title: '',
      department: 'HR Recruitment',
      openings: 5,
      experienceRequired: '1-3 Years',
      salaryRange: '₹20,000 - ₹30,000',
      location: 'Sector 62, Noida',
      status: 'Open',
    });
  };

  return (
    <div className="space-y-4 pb-12">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            Job Openings & Hiring Mandates
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active positions and hiring volume targets across Essential Soul Lifestyle
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Post New Opening</span>
        </button>
      </div>

      {/* New Job Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 text-sm">Create Hiring Requisition</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Position Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Sales Executive"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value as Department })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="HR Recruitment">HR Recruitment (Nandani)</option>
                <option value="BKD Recruitment">BKD Recruitment (Shivani)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Total Openings Required</label>
              <input
                type="number"
                required
                value={formData.openings}
                onChange={(e) => setFormData({ ...formData, openings: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Experience Required</label>
              <input
                type="text"
                value={formData.experienceRequired}
                onChange={(e) => setFormData({ ...formData, experienceRequired: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Offered Salary Range</label>
              <input
                type="text"
                value={formData.salaryRange}
                onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Open">Open</option>
                <option value="Urgent">Urgent Hiring</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-white bg-blue-600 rounded-lg font-bold hover:bg-blue-700"
            >
              Publish Job Opening
            </button>
          </div>
        </form>
      )}

      {/* Grid of openings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job) => {
          const progress = Math.min(100, Math.round((job.filled / job.openings) * 100));

          return (
            <div
              key={job.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{job.title}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      job.status === 'Urgent'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : (job.status === 'Open' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600')
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {job.department} • {job.location}
                  </p>
                </div>
                <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  {job.id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Experience</span>
                  <span className="text-slate-800 font-semibold">{job.experienceRequired}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Salary Range</span>
                  <span className="text-slate-800 font-semibold">{job.salaryRange}</span>
                </div>
              </div>

              {/* Progress bar of fulfilled openings */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Hiring Progress:</span>
                  <span className="text-blue-700 font-bold">{job.filled} of {job.openings} Active Joinings ({progress}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      progress >= 100 ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
