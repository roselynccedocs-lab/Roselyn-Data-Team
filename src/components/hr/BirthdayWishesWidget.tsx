import * as React from 'react';
import { useState } from 'react';
import { initialBirthdayWishes } from '../../data/mockHrData';
import { Cake, Send, Eye, EyeOff, Sparkles, Heart, Gift } from 'lucide-react';

export function BirthdayWishesWidget() {
  const [wishesData, setWishesData] = useState(initialBirthdayWishes);
  const [activePersonIndex, setActivePersonIndex] = useState(0);
  const [newWishInput, setNewWishInput] = useState('');
  const [myBirthdayVisible, setMyBirthdayVisible] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  const currentPerson = wishesData[activePersonIndex] || wishesData[0];

  const handleSendWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWishInput.trim()) return;

    const updated = [...wishesData];
    updated[activePersonIndex].wishes.unshift({
      from: 'Dr. Arnold Cortina (You)',
      message: newWishInput.trim(),
      timestamp: 'Just now',
    });
    setWishesData(updated);
    setNewWishInput('');
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  return (
    <div id="birthday-wishes-widget" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none bg-emerald-500/10 dark:bg-emerald-500/20 backdrop-blur-xs flex items-center justify-center z-10 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-lg border border-emerald-300 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Birthday Wish Sent! 🎉
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Cake className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Birthday Wishes!</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Send celebratory team greetings</p>
            </div>
          </div>
          <span className="text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
            <Gift className="w-3 h-3 text-rose-500" /> Next 7 days
          </span>
        </div>

        {/* Celebrant Card */}
        <div className="mt-4 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white font-bold flex items-center justify-center text-sm shadow">
                {currentPerson.avatar}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{currentPerson.employeeName}</p>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">{currentPerson.birthDateText}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {wishesData.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => setActivePersonIndex(idx)}
                  className={`w-6 h-6 rounded-full text-[10px] font-bold transition-all ${activePersonIndex === idx ? 'bg-rose-600 text-white ring-2 ring-rose-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Send wish input */}
          <form onSubmit={handleSendWish} className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="Send your own wish by typing here :)"
              value={newWishInput}
              onChange={(e) => setNewWishInput(e.target.value)}
              className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-rose-500"
            />
            <button
              type="submit"
              disabled={!newWishInput.trim()}
              className="px-3 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-xl transition-colors shadow-sm"
              title="Send Greeting"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Recent greetings */}
          <div className="mt-3 space-y-1.5 max-h-24 overflow-y-auto pr-1">
            {currentPerson.wishes.map((w, idx) => (
              <div key={idx} className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg text-[11px] border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center text-slate-500 text-[10px]">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{w.from}</span>
                  <span>{w.timestamp}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mt-0.5">{w.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visibility Privacy Setting matching image */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400">
          Your Birthday is {myBirthdayVisible ? 'visible' : 'hidden'} to others:
        </span>
        <button
          onClick={() => setMyBirthdayVisible(!myBirthdayVisible)}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${myBirthdayVisible ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200' : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'}`}
        >
          {myBirthdayVisible ? (
            <>
              <EyeOff className="w-3 h-3" /> Click here to Hide
            </>
          ) : (
            <>
              <Eye className="w-3 h-3" /> Click here to Show
            </>
          )}
        </button>
      </div>
    </div>
  );
}
