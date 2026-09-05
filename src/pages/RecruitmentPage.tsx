import * as React from 'react';
import { useState } from 'react';
import { initialVacancies, initialCandidates } from '../data/mockHrData';
import { JobVacancy, Candidate } from '../types';
import { 
  UserPlus, 
  Briefcase, 
  Search, 
  Plus, 
  Star, 
  CheckCircle2, 
  Users, 
  Clock, 
  Filter, 
  ChevronRight,
  Eye,
  Mail,
  Phone
} from 'lucide-react';

export default function RecruitmentPage() {
  const [vacancies, setVacancies] = useState<JobVacancy[]>(initialVacancies);
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [selectedVacancyId, setSelectedVacancyId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // New Job State
  const [jobTitle, setJobTitle] = useState('');
  const [jobDept, setJobDept] = useState('Research & Development');
  const [jobLocation, setJobLocation] = useState('BGC Taguig HQ / Plant');
  const [salaryRange, setSalaryRange] = useState('₱50,000 - ₱70,000 / mo');

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    const newVac: JobVacancy = {
      id: `VAC-0${vacancies.length + 1}`,
      title: jobTitle,
      department: jobDept,
      location: jobLocation,
      type: 'Full-Time',
      openings: 1,
      applicantsCount: 0,
      status: 'OPEN',
      postedDate: 'Today',
      salaryRange,
      experienceLevel: '2+ years chemical industry experience',
    };
    setVacancies([newVac, ...vacancies]);
    setShowNewJobModal(false);
    setJobTitle('');
  };

  const advanceCandidateStage = (candId: string, nextStage: Candidate['stage']) => {
    setCandidates(candidates.map(c => c.id === candId ? { ...c, stage: nextStage } : c));
    if (selectedCandidate && selectedCandidate.id === candId) {
      setSelectedCandidate({ ...selectedCandidate, stage: nextStage });
    }
  };

  const filteredCandidates = candidates.filter(c => {
    const matchesVac = selectedVacancyId === 'ALL' || c.vacancyId === selectedVacancyId;
    const matchesSearch = searchQuery === '' || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.positionApplied.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesVac && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Recruitment & ATS
            </span>
            <span className="text-xs text-slate-400">• Talent Acquisition & Hiring Pipeline</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1 text-slate-900 dark:text-white">
            Applied Vacancies & Candidate Pipeline
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            Manage open requisitions, interview scorecards, and hiring workflows from application to onboarding.
          </p>
        </div>

        <button
          onClick={() => setShowNewJobModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Post New Vacancy
        </button>
      </div>

      {/* Applied Vacancies List Cards (Matching Image 1: Applied Vacancies, Manager, Marketing, View) */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-600" /> Open Positions & Requisitions
          </h3>
          <span className="text-xs text-slate-400 font-semibold">{vacancies.length} Active Openings</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {vacancies.map((vac) => (
            <div
              key={vac.id}
              onClick={() => setSelectedVacancyId(selectedVacancyId === vac.id ? 'ALL' : vac.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm flex flex-col justify-between ${
                selectedVacancyId === vac.id
                  ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
              }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono font-bold text-blue-600">{vac.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    vac.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                    vac.status === 'INTERVIEWING' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                    'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                  }`}>
                    {vac.status}
                  </span>
                </div>

                <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-2 leading-snug">{vac.title}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{vac.department}</p>
                <p className="text-[10px] text-slate-400 mt-1">{vac.location}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-3 flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{vac.applicantsCount} Applicants</span>
                <button className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700 transition-colors">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Candidate Pipeline Kanban & Table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Candidate Pipeline & Interview Ratings</h3>
            <p className="text-xs text-slate-400">Filter by job opening or search candidate name</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {selectedVacancyId !== 'ALL' && (
              <button
                onClick={() => setSelectedVacancyId('ALL')}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-300"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>

        {/* Candidate List */}
        <div className="space-y-3">
          {filteredCandidates.map((cand) => (
            <div
              key={cand.id}
              className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-blue-300 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600/10 text-blue-600 font-bold flex items-center justify-center text-sm shrink-0">
                  {cand.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">{cand.name}</h4>
                    <div className="flex items-center text-amber-500">
                      {[...Array(cand.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Position: <strong className="text-slate-700 dark:text-slate-300">{cand.positionApplied}</strong> • Applied: {cand.appliedDate}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{cand.notes}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  cand.stage === 'JOB_OFFER' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
                  cand.stage === 'TECHNICAL_INTERVIEW' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                  cand.stage === 'MANAGEMENT_INTERVIEW' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' :
                  'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                }`}>
                  {cand.stage.replace('_', ' ')}
                </span>

                <button
                  onClick={() => setSelectedCandidate(cand)}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Candidate Profile Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedCandidate.name}</h3>
                <p className="text-slate-500">{selectedCandidate.positionApplied}</p>
              </div>
              <button 
                onClick={() => setSelectedCandidate(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-base"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1.5">
              <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Mail className="w-3.5 h-3.5 text-blue-500" /> {selectedCandidate.email}
              </p>
              <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Phone className="w-3.5 h-3.5 text-emerald-500" /> {selectedCandidate.phone}
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Interview Assessment & Notes</p>
              <p className="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl leading-relaxed">
                {selectedCandidate.notes}
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Advance Recruitment Stage</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => advanceCandidateStage(selectedCandidate.id, 'TECHNICAL_INTERVIEW')}
                  className="py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 rounded-lg font-semibold"
                >
                  Technical Exam
                </button>
                <button
                  onClick={() => advanceCandidateStage(selectedCandidate.id, 'MANAGEMENT_INTERVIEW')}
                  className="py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 rounded-lg font-semibold"
                >
                  Panel Interview
                </button>
                <button
                  onClick={() => advanceCandidateStage(selectedCandidate.id, 'JOB_OFFER')}
                  className="py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-lg font-semibold"
                >
                  Issue Offer Letter
                </button>
                <button
                  onClick={() => advanceCandidateStage(selectedCandidate.id, 'HIRED')}
                  className="py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm"
                >
                  Hire & Onboard
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="w-full py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-slate-700 dark:text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Job Modal */}
      {showNewJobModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Post New Job Vacancy</h3>
              <button 
                onClick={() => setShowNewJobModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Formulation Chemist"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Department</label>
                <select
                  value={jobDept}
                  onChange={(e) => setJobDept(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                >
                  <option>Research & Development</option>
                  <option>Quality Assurance</option>
                  <option>Manufacturing & Plant</option>
                  <option>Logistics & Supply Chain</option>
                  <option>CRM & Commercial Sales</option>
                  <option>Human Resources</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Location / Facility</label>
                <input
                  type="text"
                  required
                  value={jobLocation}
                  onChange={(e) => setJobLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Compensation Range</label>
                <input
                  type="text"
                  required
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewJobModal(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
                >
                  Publish Vacancy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
