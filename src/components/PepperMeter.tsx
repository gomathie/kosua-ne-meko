import React, { useState } from 'react';
import { Flame, Sparkles, Check, Info, Share2, Award } from 'lucide-react';
import { PEPPER_LEVELS } from '../data/eventData';
import { PepperLevel } from '../types';

export const PepperMeter: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<PepperLevel>(PEPPER_LEVELS[1]);
  const [activeTab, setActiveTab] = useState<'explorer' | 'quiz'>('explorer');
  
  // Quiz state
  const [q1, setQ1] = useState<number | null>(null);
  const [q2, setQ2] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<string | null>(null);

  const calculatePersona = () => {
    if (q1 === null || q2 === null) return;
    const score = q1 + q2;
    if (score <= 2) {
      setQuizResult('🟢 Green Meko Explorer - You like subtle warmth & rich tomato-onion aromatics with your eggs!');
    } else if (score <= 4) {
      setQuizResult('🌶️ Authentic Accra Pepper Head - Classic Scotch Bonnet lover! You know true street food perfection.');
    } else {
      setQuizResult('👑 Dzorwulu Pepper King - Unstoppable heat tolerance! You are ready for the Main Stage Pepper Challenge!');
    }
  };

  return (
    <section id="pepper-meter" className="py-16 bg-stone-900 text-white relative overflow-hidden">
      
      {/* Background Pepper Graphics */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-black uppercase tracking-wider">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>INTERACTIVE MEKO SPICE SCALE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white uppercase">
            HOW MUCH <span className="text-orange-500">MEKO</span> CAN YOU HANDLE?
          </h2>
          <p className="text-stone-300 text-sm sm:text-base">
            Every boiled egg needs the perfect spicy pepper salsa. Explore our 4 signature event pepper blends ground fresh in clay asanka bowls!
          </p>

          {/* Toggle Tabs */}
          <div className="pt-4 flex justify-center">
            <div className="bg-stone-800 p-1.5 rounded-2xl border border-stone-700 inline-flex gap-2">
              <button
                onClick={() => setActiveTab('explorer')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
                  activeTab === 'explorer'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Flame className="w-4 h-4" />
                <span>Spice Explorer</span>
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
                  activeTab === 'quiz'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Meko Quiz Persona</span>
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'explorer' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Level Selector Buttons */}
            <div className="lg:col-span-5 space-y-3">
              {PEPPER_LEVELS.map((level) => {
                const isSelected = selectedLevel.id === level.id;
                return (
                  <button
                    key={level.id}
                    onClick={() => setSelectedLevel(level)}
                    className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-stone-800 border-orange-500 shadow-xl shadow-orange-500/10 scale-[1.02]'
                        : 'bg-stone-900/60 border-stone-800 hover:border-stone-700 hover:bg-stone-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl sm:text-4xl">{level.emoji}</div>
                      <div>
                        <h3 className="font-extrabold text-base sm:text-lg text-white group-hover:text-orange-400 transition-colors">
                          {level.name}
                        </h3>
                        <p className="text-xs font-mono text-stone-400 mt-0.5">
                          {level.scoville}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-xs">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Display Card for Selected Level */}
            <div className="lg:col-span-7">
              <div
                className="rounded-3xl p-6 sm:p-8 md:p-10 border-2 transition-all duration-300 space-y-6 relative overflow-hidden"
                style={{
                  backgroundColor: '#1c1917',
                  borderColor: selectedLevel.color,
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-5xl">{selectedLevel.emoji}</span>
                    <div>
                      <span className="text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-stone-800 text-orange-400 border border-stone-700">
                        {selectedLevel.scoville}
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-black font-display text-white mt-1">
                        {selectedLevel.name}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2 border-t border-stone-800">
                  <div>
                    <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider mb-1 flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-orange-500" />
                      <span>FLAVOR PROFILE & SPICE COMPOSITION</span>
                    </h4>
                    <p className="text-stone-200 text-sm sm:text-base leading-relaxed">
                      {selectedLevel.description}
                    </p>
                  </div>

                  <div className="bg-stone-800/80 p-4 rounded-xl border border-stone-700/80">
                    <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider mb-1">
                      RECOMMENDED EGG PAIRING
                    </h4>
                    <p className="text-stone-300 text-xs sm:text-sm">
                      {selectedLevel.pairings}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-stone-400">
                  <span>Available at all Meko Stations on Sept 5</span>
                  <a href="#schedule" className="text-orange-400 font-extrabold hover:underline flex items-center gap-1">
                    <span>Watch Meko Championship Schedule</span> &rarr;
                  </a>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* Quiz Tab */
          <div className="max-w-2xl mx-auto bg-stone-800 p-6 sm:p-8 rounded-3xl border border-stone-700 space-y-6">
            <h3 className="text-xl font-black text-center text-white font-display">
              FIND YOUR MEKO PERSONA
            </h3>

            {/* Question 1 */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-stone-200 block">
                1. How do you normally take your boiled eggs?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Plain or mild salt', val: 1 },
                  { label: 'Medium fresh meko', val: 2 },
                  { label: 'Drowned in extra hot pepper!', val: 3 },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => setQ1(opt.val)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                      q1 === opt.val
                        ? 'bg-orange-600 border-orange-500 text-white'
                        : 'bg-stone-900 border-stone-700 text-stone-300 hover:bg-stone-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2 */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-stone-200 block">
                2. When your mouth catches fire from hot pepper, you:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Drink cold milk or water', val: 1 },
                  { label: 'Enjoy the sweat and keep eating!', val: 2 },
                  { label: 'Ask for MORE pepper!', val: 3 },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => setQ2(opt.val)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                      q2 === opt.val
                        ? 'bg-orange-600 border-orange-500 text-white'
                        : 'bg-stone-900 border-stone-700 text-stone-300 hover:bg-stone-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={calculatePersona}
              disabled={q1 === null || q2 === null}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-sm disabled:opacity-50 transition-all shadow-md"
            >
              REVEAL MY MEKO PERSONA
            </button>

            {quizResult && (
              <div className="bg-stone-900 p-5 rounded-2xl border-2 border-orange-500 text-center space-y-2 animate-in fade-in duration-300">
                <div className="w-10 h-10 rounded-full bg-orange-600/20 text-orange-400 mx-auto flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="text-base font-black text-orange-400 font-display">
                  YOUR OFFICIAL PERSONA:
                </h4>
                <p className="text-stone-200 font-extrabold text-sm sm:text-base leading-snug">
                  {quizResult}
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
};
