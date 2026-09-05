import * as React from 'react';
import { useState } from 'react';
import { initialTrainingCourses } from '../../data/mockHrData';
import { GitBranch, GraduationCap, ChevronRight, CheckCircle2, Clock, PlayCircle } from 'lucide-react';

export function EmployeeLifeCycleWidget() {
  const [selectedTab, setSelectedTab] = useState<'lifecycle' | 'training'>('lifecycle');
  const [courses, setCourses] = useState(initialTrainingCourses);

  const stages = [
    { name: 'Onboarding & Induction', count: 1, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200' },
    { name: 'Probationary Assessment', count: 1, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200' },
    { name: 'Regularized Staff', count: 4, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200' },
    { name: 'Career Progression & Promotion', count: 2, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200' },
    { name: 'Offboarding / Separation', count: 0, color: 'text-slate-600 bg-slate-50 dark:bg-slate-800 border-slate-200' },
  ];

  return (
    <div id="employee-lifecycle-widget" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">People Development</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Employee lifecycle & skill progression</p>
            </div>
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setSelectedTab('lifecycle')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${selectedTab === 'lifecycle' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold' : 'text-slate-500'}`}
            >
              Life Cycle (1)
            </button>
            <button
              onClick={() => setSelectedTab('training')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${selectedTab === 'training' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold' : 'text-slate-500'}`}
            >
              Training (4)
            </button>
          </div>
        </div>

        {/* Content */}
        {selectedTab === 'lifecycle' ? (
          <div className="mt-4 space-y-2.5">
            {stages.map((st, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all hover:scale-[1.01] ${st.color}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-[10px] shadow-xs">
                    {idx + 1}
                  </span>
                  <span className="font-bold">{st.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full font-extrabold text-[10px] bg-white/80 dark:bg-slate-900/80">
                    {st.count} Active
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {courses.map((course) => (
              <div
                key={course.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700 text-xs space-y-1.5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{course.title}</h4>
                    <p className="text-[10px] text-slate-400">Instructor: {course.instructor} • {course.duration}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      course.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                      course.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                      'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {course.status}
                  </span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>Enrolled: {course.enrolledCount} Staff</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{course.progress}% Completed</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
        <span>Corporate Training Score:</span>
        <span className="font-bold text-indigo-600 dark:text-indigo-400">92% Compliance</span>
      </div>
    </div>
  );
}
