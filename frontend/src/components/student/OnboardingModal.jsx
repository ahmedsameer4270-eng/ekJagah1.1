import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Target,
  Code,
  FileCode,
  Atom,
  Database,
  Cpu,
  Coffee,
  Terminal,
  Hash,
  Award
} from 'lucide-react';

const iconMap = {
  python: Code,
  javascript: FileCode,
  react: Atom,
  sql: Database,
  dsa: Cpu,
  java: Coffee,
  cpp: Terminal,
  c: Hash
};

const CAREER_ROLES = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Data Scientist',
  'Machine Learning Engineer',
  'DevOps Engineer',
  'Mobile App Developer'
];

export const OnboardingModal = ({ isOpen, onClose, onCompleted, currentRole = 'Full Stack Developer', existingPreferences = [] }) => {
  const [step, setStep] = useState(1);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);
  const [selfRatings, setSelfRatings] = useState({}); // { [skillId]: 'Beginner' | 'Intermediate' | 'Advanced' }
  const [targetRole, setTargetRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    // Fetch assessment skills catalog
    const fetchSkills = async () => {
      try {
        setLoading(true);
        const res = await api.get('/assessment/skills');
        const skills = res.data.skills || [];
        setAvailableSkills(skills);

        // Prepopulate if existing preferences exist
        if (existingPreferences && existingPreferences.length > 0) {
          const ids = existingPreferences.map((p) => p.skillId);
          setSelectedSkillIds(ids);
          const ratings = {};
          existingPreferences.forEach((p) => {
            ratings[p.skillId] = p.selfRating || 'Intermediate';
          });
          setSelfRatings(ratings);
        } else {
          // Default popular selection
          setSelectedSkillIds(['python', 'javascript', 'sql']);
          setSelfRatings({
            python: 'Intermediate',
            javascript: 'Intermediate',
            sql: 'Beginner'
          });
        }
      } catch (err) {
        console.error('Failed to load skills for onboarding:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
    if (currentRole) setTargetRole(currentRole);
  }, [isOpen, currentRole]);

  if (!isOpen) return null;

  const toggleSkill = (skillId) => {
    setSelectedSkillIds((prev) => {
      if (prev.includes(skillId)) {
        const next = prev.filter((id) => id !== skillId);
        const nextRatings = { ...selfRatings };
        delete nextRatings[skillId];
        setSelfRatings(nextRatings);
        return next;
      } else {
        setSelfRatings((r) => ({
          ...r,
          [skillId]: r[skillId] || 'Intermediate'
        }));
        return [...prev, skillId];
      }
    });
  };

  const handleSetRating = (skillId, rating) => {
    setSelfRatings((prev) => ({
      ...prev,
      [skillId]: rating
    }));
  };

  const handleSubmit = async () => {
    if (selectedSkillIds.length === 0) {
      setError('Please select at least one skill or programming language.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const preferences = selectedSkillIds.map((id) => ({
        skillId: id,
        selfRating: selfRatings[id] || 'Intermediate'
      }));

      const res = await api.post('/student/preferences', {
        preferences,
        targetCareerRole: targetRole
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (onCompleted) {
        onCompleted(res.data);
      }
      onClose();
    } catch (err) {
      console.error('Failed to save preferences:', err);
      setError(err.response?.data?.error || 'Failed to save preferences.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 relative animate-scale-up max-h-[90vh] flex flex-col justify-between overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition p-1.5 rounded-xl hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step Indicator */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Personalized Skill Path • Step {step} of 2</span>
            </div>
            <span className="text-xs text-slate-400 font-semibold">
              {selectedSkillIds.length} skills selected
            </span>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mt-3">
            {step === 1
              ? 'Which programming skills are you interested in?'
              : 'Rate your proficiency & career goal'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {step === 1
              ? 'Select the languages and technologies you know or want to get certified in. We will surface targeted assessments for you.'
              : 'Your self-ratings help us calibrate your starting assessments and build your ATS-ready resume.'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* STEP 1: Skill Selection Chips */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400 font-bold">
                Loading skill catalog...
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {availableSkills.map((skill) => {
                  const Icon = iconMap[skill.id] || Code;
                  const isSelected = selectedSkillIds.includes(skill.id);

                  return (
                    <div
                      key={skill.id}
                      onClick={() => toggleSkill(skill.id)}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex flex-col items-center text-center relative group ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                      )}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">{skill.name}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        {skill.category}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Self Rating & Target Role */}
        {step === 2 && (
          <div className="space-y-5 py-2">
            {/* Target Career Role selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-600" />
                <span>Primary Target Career Role:</span>
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {CAREER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Per-skill self rating cards */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              <label className="block text-xs font-bold text-slate-700">
                Self-Rated Proficiency:
              </label>
              {selectedSkillIds.map((id) => {
                const skillObj = availableSkills.find((s) => s.id === id);
                const skillName = skillObj?.name || id;
                const currentRating = selfRatings[id] || 'Intermediate';

                return (
                  <div
                    key={id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <span className="text-xs font-bold text-slate-800">{skillName}</span>
                    <div className="flex items-center gap-1.5">
                      {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => handleSetRating(id, lvl)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                            currentRating === lvl
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {step === 1 ? (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
            >
              Skip for now
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}

          {step === 1 ? (
            <button
              type="button"
              onClick={() => {
                if (selectedSkillIds.length === 0) {
                  setError('Please select at least 1 skill.');
                  return;
                }
                setError('');
                setStep(2);
              }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Personalizing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save & Apply Preferences</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
