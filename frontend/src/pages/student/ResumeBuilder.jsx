import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import confetti from 'canvas-confetti';
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit3,
  Globe,
  Code2,
  Share2,
  Mail,
  GraduationCap,
  Award,
  BookOpen,
  ShieldCheck,
  RotateCcw,
  Sliders,
  ChevronRight,
  Eye,
  Check,
  Building,
  Calendar,
  ExternalLink,
  FolderGit2,
  Phone,
  MapPin,
  Star,
  Terminal,
  ArrowUp,
  ArrowDown,
  X
} from 'lucide-react';

export const ResumeBuilder = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Resume Data
  const [personalInfo, setPersonalInfo] = useState({});
  const [summary, setSummary] = useState('');
  const [technicalSkills, setTechnicalSkills] = useState([]);
  const [softSkills, setSoftSkills] = useState([]);
  const [verifiedSkills, setVerifiedSkills] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [experience, setExperience] = useState([]);

  // Settings & Toggles
  const [template, setTemplate] = useState('modern'); // 'modern' | 'classic' | 'minimal'
  const [accentColor, setAccentColor] = useState('#4f46e5'); // indigo default
  const [showVerifiedBadges, setShowVerifiedBadges] = useState(true);
  const [showCertificates, setShowCertificates] = useState(true);
  const [showCourses, setShowCourses] = useState(true);
  const [showProjects, setShowProjects] = useState(true);
  const [showExperience, setShowExperience] = useState(true);
  const [isActiveResume, setIsActiveResume] = useState(false);

  // Social & Contact Toggles
  const [showPhone, setShowPhone] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const [showGithub, setShowGithub] = useState(true);
  const [showLinkedin, setShowLinkedin] = useState(true);
  const [showPortfolio, setShowPortfolio] = useState(true);
  const [showLeetcode, setShowLeetcode] = useState(true);
  const [showTwitter, setShowTwitter] = useState(true);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('template'); // 'template' | 'contact' | 'content' | 'projects'

  // Projects filter & creator state
  const [projectFilter, setProjectFilter] = useState('all'); // 'all' | 'featured'
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: '',
    role: 'Solo Developer',
    startDate: '',
    endDate: 'Present',
    description: '',
    techStack: [],
    techInput: '',
    bullets: [''],
    githubLink: '',
    liveDemoLink: '',
    featured: true
  });

  // Experience form state
  const [newExp, setNewExp] = useState({ role: '', company: '', duration: '', description: '' });

  useEffect(() => {
    fetchResumeData();
  }, []);

  const fetchResumeData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/student/resume-data');
      const d = res.data.resumeData || res.data.resume;

      const pInfo = d.personalInfo || {};
      setPersonalInfo({
        fullName: pInfo.fullName || '',
        email: pInfo.email || '',
        phone: pInfo.phone || '',
        location: pInfo.location || '',
        college: pInfo.college || '',
        branch: pInfo.branch || '',
        cgpa: pInfo.cgpa || '',
        graduationYear: pInfo.graduationYear || '',
        targetCareerRole: pInfo.targetCareerRole || 'Software Engineer',
        portfolioUrl: pInfo.portfolioUrl || '',
        githubUrl: pInfo.githubUrl || '',
        linkedinUrl: pInfo.linkedinUrl || '',
        leetcodeUrl: pInfo.leetcodeUrl || '',
        twitterUrl: pInfo.twitterUrl || '',
        resumeUrl: pInfo.resumeUrl || ''
      });

      setSummary(d.summary || '');
      setTechnicalSkills(d.technicalSkills || []);
      setSoftSkills(d.softSkills || []);
      setVerifiedSkills(d.verifiedSkills || []);
      setCertificates(d.certificates || []);
      setCompletedCourses(d.completedCourses || []);

      // Format projects
      const initialProjects = (d.projects || []).map((p) => ({
        id: p.id || Math.random().toString(),
        title: p.title || 'Project',
        role: p.role || 'Developer',
        startDate: p.startDate || '',
        endDate: p.endDate || 'Present',
        description: p.description || '',
        techStack: Array.isArray(p.techStack)
          ? p.techStack
          : typeof p.techStack === 'string'
          ? p.techStack.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        bullets: Array.isArray(p.bullets) ? p.bullets : p.description ? [p.description] : [],
        githubLink: p.githubLink || p.githubUrl || '',
        liveDemoLink: p.liveDemoLink || p.liveUrl || '',
        featured: p.featured !== undefined ? Boolean(p.featured) : true,
        includedInResume: p.includedInResume !== undefined ? Boolean(p.includedInResume) : true
      }));
      setProjects(initialProjects);

      setExperience(d.experience || []);

      if (d.resumeSettings) {
        setTemplate(d.resumeSettings.template || 'modern');
        setAccentColor(d.resumeSettings.accentColor || '#4f46e5');
        setShowVerifiedBadges(d.resumeSettings.showVerifiedBadges ?? true);
        setShowCertificates(d.resumeSettings.showCertificates ?? true);
        setShowCourses(d.resumeSettings.showCourses ?? true);
        setShowProjects(d.resumeSettings.showProjects ?? true);
        setShowExperience(d.resumeSettings.showExperience ?? true);
        if (d.resumeSettings.showPhone !== undefined) setShowPhone(d.resumeSettings.showPhone);
        if (d.resumeSettings.showLocation !== undefined) setShowLocation(d.resumeSettings.showLocation);
        if (d.resumeSettings.showGithub !== undefined) setShowGithub(d.resumeSettings.showGithub);
        if (d.resumeSettings.showLinkedin !== undefined) setShowLinkedin(d.resumeSettings.showLinkedin);
        if (d.resumeSettings.showPortfolio !== undefined) setShowPortfolio(d.resumeSettings.showPortfolio);
        if (d.resumeSettings.showLeetcode !== undefined) setShowLeetcode(d.resumeSettings.showLeetcode);
        if (d.resumeSettings.showTwitter !== undefined) setShowTwitter(d.resumeSettings.showTwitter);
      }

      setIsActiveResume(pInfo.resumeUrl === '/student/resume');
    } catch (err) {
      console.error('Failed to load resume data:', err);
      setError('Failed to load resume data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (setActive = false) => {
    try {
      setSaving(true);
      setError('');
      setMessage('');

      const resumeSettings = {
        template,
        accentColor,
        showVerifiedBadges,
        showCertificates,
        showCourses,
        showProjects,
        showExperience,
        showPhone,
        showLocation,
        showGithub,
        showLinkedin,
        showPortfolio,
        showLeetcode,
        showTwitter
      };

      const res = await api.post('/student/resume-data', {
        summary,
        projects,
        experience,
        personalInfo,
        resumeSettings,
        setActiveProfileResume: setActive || isActiveResume
      });

      if (setActive) {
        setIsActiveResume(true);
      }

      setMessage('Resume customized and saved successfully!');
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error('Failed to save resume data:', err);
      setError(err.response?.data?.error || 'Failed to save resume data.');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Projects helpers
  const handleMoveProject = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= projects.length) return;
    const updated = [...projects];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setProjects(updated);
  };

  const handleToggleProjectInclusion = (id) => {
    setProjects(
      projects.map((p) =>
        p.id === id ? { ...p, includedInResume: p.includedInResume !== undefined ? !p.includedInResume : false } : p
      )
    );
  };

  const handleToggleProjectFeatured = (id) => {
    setProjects(
      projects.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p))
    );
  };

  const handleRemoveProject = (id) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  const openAddProjectForm = () => {
    setEditingProjectId(null);
    setProjectForm({
      title: '',
      role: 'Solo Developer',
      startDate: '',
      endDate: 'Present',
      description: '',
      techStack: [],
      techInput: '',
      bullets: [''],
      githubLink: '',
      liveDemoLink: '',
      featured: true
    });
    setIsAddingProject(true);
  };

  const openEditProjectForm = (p) => {
    setEditingProjectId(p.id);
    setProjectForm({
      title: p.title || '',
      role: p.role || 'Developer',
      startDate: p.startDate || '',
      endDate: p.endDate || 'Present',
      description: p.description || '',
      techStack: Array.isArray(p.techStack) ? p.techStack : [],
      techInput: '',
      bullets: Array.isArray(p.bullets) && p.bullets.length > 0 ? p.bullets : [''],
      githubLink: p.githubLink || p.githubUrl || '',
      liveDemoLink: p.liveDemoLink || p.liveUrl || '',
      featured: p.featured !== undefined ? p.featured : true
    });
    setIsAddingProject(true);
  };

  const handleSaveProjectForm = (e) => {
    e.preventDefault();
    if (!projectForm.title.trim()) return;

    const formattedProj = {
      title: projectForm.title.trim(),
      role: projectForm.role.trim() || 'Developer',
      startDate: projectForm.startDate.trim(),
      endDate: projectForm.endDate.trim() || 'Present',
      description: projectForm.description.trim(),
      techStack: projectForm.techStack,
      bullets: projectForm.bullets.filter((b) => b.trim().length > 0),
      githubLink: projectForm.githubLink.trim(),
      liveDemoLink: projectForm.liveDemoLink.trim(),
      featured: projectForm.featured,
      includedInResume: true
    };

    if (editingProjectId) {
      setProjects(
        projects.map((p) => (p.id === editingProjectId ? { ...p, ...formattedProj, id: editingProjectId } : p))
      );
    } else {
      setProjects([{ id: Date.now().toString(), ...formattedProj }, ...projects]);
    }

    setIsAddingProject(false);
    setEditingProjectId(null);
  };

  const handleAddProjectTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = projectForm.techInput.trim().replace(/^,|,$/g, '');
      if (val && !projectForm.techStack.includes(val)) {
        setProjectForm({
          ...projectForm,
          techStack: [...projectForm.techStack, val],
          techInput: ''
        });
      }
    }
  };

  const handleQuickAddTag = (tag) => {
    if (!projectForm.techStack.includes(tag)) {
      setProjectForm({
        ...projectForm,
        techStack: [...projectForm.techStack, tag]
      });
    }
  };

  const handleRemoveProjectTag = (tag) => {
    setProjectForm({
      ...projectForm,
      techStack: projectForm.techStack.filter((t) => t !== tag)
    });
  };

  const handleBulletChange = (idx, val) => {
    const updated = [...projectForm.bullets];
    updated[idx] = val;
    setProjectForm({ ...projectForm, bullets: updated });
  };

  const handleAddBullet = () => {
    setProjectForm({ ...projectForm, bullets: [...projectForm.bullets, ''] });
  };

  const handleRemoveBullet = (idx) => {
    if (projectForm.bullets.length <= 1) {
      setProjectForm({ ...projectForm, bullets: [''] });
      return;
    }
    setProjectForm({ ...projectForm, bullets: projectForm.bullets.filter((_, i) => i !== idx) });
  };

  // Experience helpers
  const handleAddExp = (e) => {
    e.preventDefault();
    if (!newExp.role.trim() || !newExp.company.trim()) return;
    setExperience([
      ...experience,
      {
        id: Date.now().toString(),
        ...newExp
      }
    ]);
    setNewExp({ role: '', company: '', duration: '', description: '' });
  };

  const handleRemoveExp = (id) => {
    setExperience(experience.filter((e) => e.id !== id));
  };

  // Filtered projects for live preview
  const activeResumeProjects = projects.filter((p) => p.includedInResume !== false);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h3 className="text-base font-bold text-slate-800">Compiling EkJagah Verified Resume...</h3>
        <p className="text-xs text-slate-500 mt-1">Aggregating credentials, skills, courses, and educational history.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Action Header (Hidden on Print) */}
      <div className="print:hidden bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="EkJagah" className="w-5 h-5 rounded-lg object-cover shadow-xs" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              EkJagah Career Engine
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              ATS-READY
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            <span>Auto-Generated Resume & CV</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Synthesizes your verified credentials, engineering projects, social portfolios, and academic profile into a professional hire-ready resume.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border ${
              isActiveResume
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isActiveResume ? 'Active Profile Resume' : 'Set as Active Resume'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
          >
            <Printer className="w-4 h-4" />
            <span>Download PDF / Print</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="print:hidden p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="print:hidden p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Main Workspace: Controls Left + Live A4 Sheet Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Controls & Customizer (Hidden on Print) */}
        <div className="lg:col-span-4 print:hidden space-y-4">
          {/* Customizer Navigation Tabs */}
          <div className="bg-white rounded-2xl p-1.5 border border-slate-200 flex gap-1 shadow-sm">
            <button
              onClick={() => setActiveTab('template')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
                activeTab === 'template' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Style
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
                activeTab === 'contact' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Contact
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
                activeTab === 'content' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
                activeTab === 'projects' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Projects
            </button>
          </div>

          {/* TAB 1: Template & Styling */}
          {activeTab === 'template' && (
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Resume Template
              </h3>
              <div className="space-y-2">
                {[
                  { id: 'modern', name: 'Modern Tech', desc: 'Left accent rail, verified badges, clean contemporary feel' },
                  { id: 'classic', name: 'Classic ATS', desc: 'Standard single-column format optimized for applicant tracking systems' },
                  { id: 'minimal', name: 'Executive Minimalist', desc: 'Elegant typography, thin horizontal rules, compact density' }
                ].map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition ${
                      template === t.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{t.name}</span>
                      {template === t.id && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{t.desc}</p>
                  </div>
                ))}
              </div>

              {/* Accent Color Swatches */}
              <div className="pt-3 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Accent Color
                </h3>
                <div className="flex items-center gap-2">
                  {[
                    { color: '#4f46e5', label: 'Indigo' },
                    { color: '#059669', label: 'Emerald' },
                    { color: '#2563eb', label: 'Royal Blue' },
                    { color: '#7c3aed', label: 'Purple' },
                    { color: '#d97706', label: 'Amber' },
                    { color: '#0f172a', label: 'Slate' }
                  ].map((c) => (
                    <button
                      key={c.color}
                      onClick={() => setAccentColor(c.color)}
                      style={{ backgroundColor: c.color }}
                      className={`w-7 h-7 rounded-xl transition flex items-center justify-center ${
                        accentColor === c.color ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''
                      }`}
                      title={c.label}
                    >
                      {accentColor === c.color && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Contact & Social Profiles */}
          {activeTab === 'contact' && (
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Personal Info & Social Links
              </h3>
              <p className="text-[11px] text-slate-500 -mt-2">
                Edit links and toggle their visibility on your printed resume.
              </p>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>Phone</span>
                    </label>
                    <label className="flex items-center gap-1 text-[11px] text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showPhone}
                        onChange={(e) => setShowPhone(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span>Show</span>
                    </label>
                  </div>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={personalInfo.phone || ''}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>Location / City</span>
                    </label>
                    <label className="flex items-center gap-1 text-[11px] text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showLocation}
                        onChange={(e) => setShowLocation(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span>Show</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru, India"
                    value={personalInfo.location || ''}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>GitHub</span>
                    </label>
                    <label className="flex items-center gap-1 text-[11px] text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showGithub}
                        onChange={(e) => setShowGithub(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span>Show</span>
                    </label>
                  </div>
                  <input
                    type="url"
                    placeholder="https://github.com/username"
                    value={personalInfo.githubUrl || ''}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, githubUrl: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>LinkedIn</span>
                    </label>
                    <label className="flex items-center gap-1 text-[11px] text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showLinkedin}
                        onChange={(e) => setShowLinkedin(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span>Show</span>
                    </label>
                  </div>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={personalInfo.linkedinUrl || ''}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, linkedinUrl: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-500" />
                      <span>Portfolio / Website</span>
                    </label>
                    <label className="flex items-center gap-1 text-[11px] text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showPortfolio}
                        onChange={(e) => setShowPortfolio(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span>Show</span>
                    </label>
                  </div>
                  <input
                    type="url"
                    placeholder="https://myportfolio.dev"
                    value={personalInfo.portfolioUrl || ''}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, portfolioUrl: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-slate-500" />
                      <span>LeetCode / Coding Profile</span>
                    </label>
                    <label className="flex items-center gap-1 text-[11px] text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showLeetcode}
                        onChange={(e) => setShowLeetcode(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span>Show</span>
                    </label>
                  </div>
                  <input
                    type="url"
                    placeholder="https://leetcode.com/u/username"
                    value={personalInfo.leetcodeUrl || ''}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, leetcodeUrl: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      <span>Twitter / X</span>
                    </label>
                    <label className="flex items-center gap-1 text-[11px] text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showTwitter}
                        onChange={(e) => setShowTwitter(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span>Show</span>
                    </label>
                  </div>
                  <input
                    type="url"
                    placeholder="https://x.com/username"
                    value={personalInfo.twitterUrl || ''}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, twitterUrl: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Summary & Section Toggles */}
          {activeTab === 'content' && (
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  Professional Summary
                </h3>
                <textarea
                  rows={5}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Summary of your technical expertise and career direction..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Section Visibility Toggles */}
              <div className="pt-2 border-t border-slate-100 space-y-2.5">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Include Sections
                </h3>

                {[
                  { label: 'EkJagah Verified Skill Badges', state: showVerifiedBadges, set: setShowVerifiedBadges },
                  { label: 'Academic & Engineering Projects', state: showProjects, set: setShowProjects },
                  { label: 'Approved Certificates', state: showCertificates, set: setShowCertificates },
                  { label: 'Completed Courses', state: showCourses, set: setShowCourses },
                  { label: 'Work Experience / Internships', state: showExperience, set: setShowExperience }
                ].map((sec) => (
                  <label key={sec.label} className="flex items-center justify-between text-xs text-slate-700 cursor-pointer p-1">
                    <span>{sec.label}</span>
                    <input
                      type="checkbox"
                      checked={sec.state}
                      onChange={(e) => sec.set(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Projects & Experience Manager */}
          {activeTab === 'projects' && (
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-5">
              {/* Project Manager Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FolderGit2 className="w-4 h-4 text-indigo-600" />
                    <span>Projects ({projects.length})</span>
                  </h3>
                  <button
                    type="button"
                    onClick={openAddProjectForm}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Project</span>
                  </button>
                </div>

                {/* Projects Filter Pills */}
                <div className="flex gap-1 mb-2.5">
                  <button
                    type="button"
                    onClick={() => setProjectFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      projectFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All ({projects.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjectFilter('featured')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                      projectFilter === 'featured'
                        ? 'bg-amber-500 text-white'
                        : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    <Star className="w-3 h-3 fill-current" />
                    <span>Featured ({projects.filter((p) => p.featured).length})</span>
                  </button>
                </div>

                {/* Projects List with Reordering & Inclusion */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {projects
                    .filter((p) => (projectFilter === 'featured' ? p.featured : true))
                    .map((p, idx) => (
                      <div
                        key={p.id}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition ${
                          p.includedInResume !== false
                            ? 'bg-slate-50 border-slate-200'
                            : 'bg-slate-100/60 border-dashed border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={p.includedInResume !== false}
                            onChange={() => handleToggleProjectInclusion(p.id)}
                            title="Include on resume"
                            className="w-3.5 h-3.5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-800 truncate flex items-center gap-1.5">
                              <span>{p.title}</span>
                              {p.featured && (
                                <Star className="w-3 h-3 fill-amber-400 text-amber-500 flex-shrink-0" />
                              )}
                            </h4>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {p.role} • {Array.isArray(p.techStack) ? p.techStack.join(', ') : p.techStack}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveProject(idx, -1)}
                            disabled={idx === 0}
                            className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-20"
                            title="Move up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveProject(idx, 1)}
                            disabled={idx === projects.length - 1}
                            className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-20"
                            title="Move down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleProjectFeatured(p.id)}
                            className={`p-1 ${p.featured ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'}`}
                            title={p.featured ? 'Featured on resume' : 'Click to feature'}
                          >
                            <Star className={`w-3.5 h-3.5 ${p.featured ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditProjectForm(p)}
                            className="p-1 text-slate-400 hover:text-indigo-600"
                            title="Edit project"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveProject(p.id)}
                            className="p-1 text-slate-400 hover:text-rose-500"
                            title="Delete project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Add / Edit Project Form Box */}
                {isAddingProject && (
                  <form onSubmit={handleSaveProjectForm} className="mt-3 p-3 bg-indigo-50/50 border border-indigo-200 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-900">
                        {editingProjectId ? 'Edit Project' : 'New Project'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAddingProject(false)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Project Title *"
                        value={projectForm.title}
                        onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Role (e.g. Lead Developer)"
                        value={projectForm.role}
                        onChange={(e) => setProjectForm({ ...projectForm, role: e.target.value })}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Start (e.g. Jan 2026)"
                        value={projectForm.startDate}
                        onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        placeholder="End (e.g. Present)"
                        value={projectForm.endDate}
                        onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <textarea
                        rows={2}
                        placeholder="Brief overview description..."
                        value={projectForm.description}
                        onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    {/* Tech stack chips */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Technologies (Enter or comma)
                      </label>
                      <div className="p-1.5 bg-white border border-slate-200 rounded-lg flex flex-wrap gap-1.5 items-center min-h-[36px]">
                        {projectForm.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-[11px] font-medium text-slate-800"
                          >
                            <span>{tech}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveProjectTag(tech)}
                              className="text-slate-400 hover:text-rose-500"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          placeholder="Type tech..."
                          value={projectForm.techInput}
                          onChange={(e) => setProjectForm({ ...projectForm, techInput: e.target.value })}
                          onKeyDown={handleAddProjectTag}
                          className="flex-1 min-w-[80px] bg-transparent text-xs focus:outline-none px-1"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {['React', 'Node.js', 'Python', 'SQL', 'TypeScript'].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleQuickAddTag(tag)}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-indigo-100"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bullets */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-600 uppercase">
                          Achievement Bullets (ATS Impact)
                        </span>
                        <button
                          type="button"
                          onClick={handleAddBullet}
                          className="text-[10px] text-indigo-600 font-bold hover:underline"
                        >
                          + Bullet
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {projectForm.bullets.map((b, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400">•</span>
                            <input
                              type="text"
                              placeholder="Achievement point..."
                              value={b}
                              onChange={(e) => handleBulletChange(idx, e.target.value)}
                              className="flex-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveBullet(idx)}
                              className="text-slate-400 hover:text-rose-500 p-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="url"
                        placeholder="GitHub URL"
                        value={projectForm.githubLink}
                        onChange={(e) => setProjectForm({ ...projectForm, githubLink: e.target.value })}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                      <input
                        type="url"
                        placeholder="Live Demo URL"
                        value={projectForm.liveDemoLink}
                        onChange={(e) => setProjectForm({ ...projectForm, liveDemoLink: e.target.value })}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={projectForm.featured}
                        onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })}
                        className="w-3.5 h-3.5 text-amber-500 rounded cursor-pointer"
                      />
                      <span>Feature on resume</span>
                    </label>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingProject(false)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm"
                      >
                        {editingProjectId ? 'Update' : 'Add to List'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Experience list */}
              <div className="pt-3 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Internships / Work Experience ({experience.length})
                </h3>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {experience.map((exp) => (
                    <div key={exp.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-800 truncate">{exp.role} @ {exp.company}</h4>
                        <span className="text-[10px] text-slate-400">{exp.duration}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveExp(exp.id)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddExp} className="mt-3 space-y-2 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Role Title"
                      value={newExp.role}
                      onChange={(e) => setNewExp({ ...newExp, role: e.target.value })}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={newExp.company}
                      onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Duration (e.g. Summer 2026 • 3 mos)"
                    value={newExp.duration}
                    onChange={(e) => setNewExp({ ...newExp, duration: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs rounded-lg transition flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Experience</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Live Print-Ready A4 Resume Sheet */}
        <div className="lg:col-span-8 flex justify-center w-full">
          <div
            id="resume-a4-sheet"
            className="w-full max-w-[800px] min-h-[1050px] bg-white text-slate-900 shadow-2xl rounded-2xl print:rounded-none print:shadow-none p-8 sm:p-12 print:p-8 border border-slate-200 print:border-none relative transition-all duration-300 font-sans"
            style={{
              fontFamily: template === 'minimal' ? 'Georgia, serif' : 'Inter, system-ui, sans-serif'
            }}
          >
            {/* Header / Identity Banner */}
            <div
              className={`pb-5 mb-5 border-b ${
                template === 'classic'
                  ? 'text-center border-slate-300'
                  : 'flex flex-col sm:flex-row sm:items-start justify-between border-slate-200'
              }`}
            >
              <div>
                <h1
                  className="text-2xl sm:text-3xl font-black tracking-tight"
                  style={{ color: accentColor }}
                >
                  {personalInfo.fullName || 'Student Name'}
                </h1>
                <p className="text-sm font-extrabold text-slate-700 tracking-wide mt-0.5 uppercase">
                  {personalInfo.targetCareerRole || 'Software Engineer'}
                </p>

                {/* College / Degree */}
                <div
                  className={`flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-600 ${
                    template === 'classic' ? 'justify-center' : ''
                  }`}
                >
                  <span className="font-bold">{personalInfo.college || 'Institution'}</span>
                  {personalInfo.branch && <span>• {personalInfo.branch}</span>}
                  {personalInfo.cgpa && (
                    <span className="font-extrabold text-slate-900">• CGPA: {personalInfo.cgpa}</span>
                  )}
                  {personalInfo.graduationYear && (
                    <span>• Class of {personalInfo.graduationYear}</span>
                  )}
                </div>
              </div>

              {/* Contact / Social Strip */}
              {template === 'classic' ? (
                <div className="text-center mt-3 text-xs text-slate-700 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                  {showLocation && personalInfo.location && (
                    <span>{personalInfo.location}</span>
                  )}
                  {showPhone && personalInfo.phone && (
                    <span>• {personalInfo.phone}</span>
                  )}
                  {personalInfo.email && (
                    <span>• {personalInfo.email}</span>
                  )}
                  {showGithub && personalInfo.githubUrl && (
                    <span>
                      •{' '}
                      <a
                        href={personalInfo.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-800 hover:underline font-medium"
                      >
                        github.com/{personalInfo.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\/?/, '')}
                      </a>
                    </span>
                  )}
                  {showLinkedin && personalInfo.linkedinUrl && (
                    <span>
                      •{' '}
                      <a
                        href={personalInfo.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-800 hover:underline font-medium"
                      >
                        linkedin.com/in/{personalInfo.linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\/?/, '')}
                      </a>
                    </span>
                  )}
                  {showLeetcode && personalInfo.leetcodeUrl && (
                    <span>
                      •{' '}
                      <a
                        href={personalInfo.leetcodeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-800 hover:underline font-medium"
                      >
                        leetcode.com/{personalInfo.leetcodeUrl.replace(/^https?:\/\/(www\.)?leetcode\.com\/(u\/)?/, '')}
                      </a>
                    </span>
                  )}
                  {showPortfolio && personalInfo.portfolioUrl && (
                    <span>
                      •{' '}
                      <a
                        href={personalInfo.portfolioUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-800 hover:underline font-medium"
                      >
                        {personalInfo.portfolioUrl.replace(/^https?:\/\//, '')}
                      </a>
                    </span>
                  )}
                  {showTwitter && personalInfo.twitterUrl && (
                    <span>
                      •{' '}
                      <a
                        href={personalInfo.twitterUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-800 hover:underline font-medium"
                      >
                        x.com/{personalInfo.twitterUrl.replace(/^https?:\/\/(www\.)?(twitter|x)\.com\/?/, '')}
                      </a>
                    </span>
                  )}
                </div>
              ) : (
                <div className="mt-4 sm:mt-0 flex flex-wrap sm:flex-col gap-1.5 text-xs text-slate-600 sm:items-end">
                  {personalInfo.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{personalInfo.email}</span>
                    </span>
                  )}
                  {showPhone && personalInfo.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{personalInfo.phone}</span>
                    </span>
                  )}
                  {showLocation && personalInfo.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{personalInfo.location}</span>
                    </span>
                  )}
                  {showGithub && personalInfo.githubUrl && (
                    <a
                      href={personalInfo.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-slate-700 hover:underline"
                    >
                      <Code2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{personalInfo.githubUrl.replace(/^https?:\/\//, '')}</span>
                    </a>
                  )}
                  {showLinkedin && personalInfo.linkedinUrl && (
                    <a
                      href={personalInfo.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-slate-700 hover:underline"
                    >
                      <Share2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{personalInfo.linkedinUrl.replace(/^https?:\/\//, '')}</span>
                    </a>
                  )}
                  {showPortfolio && personalInfo.portfolioUrl && (
                    <a
                      href={personalInfo.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-slate-700 hover:underline"
                    >
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <span>{personalInfo.portfolioUrl.replace(/^https?:\/\//, '')}</span>
                    </a>
                  )}
                  {showLeetcode && personalInfo.leetcodeUrl && (
                    <a
                      href={personalInfo.leetcodeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-slate-700 hover:underline"
                    >
                      <Terminal className="w-3.5 h-3.5 text-slate-400" />
                      <span>{personalInfo.leetcodeUrl.replace(/^https?:\/\//, '')}</span>
                    </a>
                  )}
                  {showTwitter && personalInfo.twitterUrl && (
                    <a
                      href={personalInfo.twitterUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-slate-700 hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      <span>{personalInfo.twitterUrl.replace(/^https?:\/\//, '')}</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Summary */}
            {summary && (
              <div className="mb-6">
                <h3
                  className="text-xs font-black uppercase tracking-wider mb-2"
                  style={{ color: accentColor }}
                >
                  Professional Summary
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed text-justify">
                  {summary}
                </p>
              </div>
            )}

            {/* Verified EkJagah Assessment Skills Section */}
            {showVerifiedBadges && verifiedSkills.length > 0 && (
              <div className="mb-6 p-4 rounded-xl bg-slate-50/80 border border-slate-200">
                <div className="flex items-center justify-between mb-2.5">
                  <h3
                    className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
                    style={{ color: accentColor }}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>EkJagah Standardized Verified Competencies</span>
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Tamper-Evident Proctored Benchmarks
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {verifiedSkills.map((vs) => (
                    <div
                      key={vs.skillId}
                      className="p-2.5 rounded-lg bg-white border border-slate-200 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-900">{vs.skillName}</span>
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {vs.verdict || 'Competent'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 font-mono">
                        <span>Tier: {vs.level}</span>
                        <span className="font-extrabold text-emerald-600">{vs.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills: Technical & Soft */}
            <div className="mb-6">
              <h3
                className="text-xs font-black uppercase tracking-wider mb-2"
                style={{ color: accentColor }}
              >
                Skills & Technologies
              </h3>
              <div className="text-xs space-y-1.5 leading-relaxed">
                <div>
                  <strong className="text-slate-900">Technical Skills: </strong>
                  <span className="text-slate-700">
                    {technicalSkills.map((s) => `${s.name} (${s.level})`).join(', ')}
                  </span>
                </div>
                {softSkills.length > 0 && (
                  <div>
                    <strong className="text-slate-900">Professional Attributes: </strong>
                    <span className="text-slate-700">{softSkills.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Engineering Projects Section */}
            {showProjects && activeResumeProjects.length > 0 && (
              <div className="mb-6">
                <h3
                  className="text-xs font-black uppercase tracking-wider mb-3"
                  style={{ color: accentColor }}
                >
                  Featured Engineering Projects
                </h3>

                <div className="space-y-4">
                  {activeResumeProjects.map((proj) => (
                    <div key={proj.id} className="space-y-1.5">
                      {/* Project Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="text-xs font-extrabold text-slate-900">{proj.title}</span>
                          {proj.role && (
                            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {proj.role}
                            </span>
                          )}
                        </div>
                        {(proj.startDate || proj.endDate) && (
                          <span className="text-[11px] text-slate-500 font-mono">
                            {proj.startDate} {proj.startDate && proj.endDate ? '–' : ''} {proj.endDate}
                          </span>
                        )}
                      </div>

                      {/* Links row */}
                      {(proj.githubLink || proj.liveDemoLink) && (
                        <div className="flex items-center gap-3 text-[11px]">
                          {proj.githubLink && (
                            <a
                              href={proj.githubLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-slate-700 hover:text-indigo-600 font-medium hover:underline"
                            >
                              <Code2 className="w-3 h-3 text-slate-400" />
                              <span>Code</span>
                            </a>
                          )}
                          {proj.liveDemoLink && (
                            <a
                              href={proj.liveDemoLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-slate-700 hover:text-indigo-600 font-medium hover:underline"
                            >
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                              <span>Live Demo</span>
                            </a>
                          )}
                        </div>
                      )}

                      {/* Tech stack tags */}
                      {Array.isArray(proj.techStack) && proj.techStack.length > 0 && (
                        <div className="text-[11px] text-slate-600">
                          <strong className="text-slate-800">Technologies: </strong>
                          <span className="font-mono">{proj.techStack.join(', ')}</span>
                        </div>
                      )}

                      {/* Description */}
                      {proj.description && (
                        <p className="text-xs text-slate-700 leading-normal">{proj.description}</p>
                      )}

                      {/* Achievement / Impact Bullets */}
                      {Array.isArray(proj.bullets) && proj.bullets.length > 0 && (
                        <ul className="space-y-1 text-xs text-slate-700 pl-4 list-disc mt-1">
                          {proj.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="leading-relaxed">
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Work Experience */}
            {showExperience && experience.length > 0 && (
              <div className="mb-6">
                <h3
                  className="text-xs font-black uppercase tracking-wider mb-3"
                  style={{ color: accentColor }}
                >
                  Professional Experience & Internships
                </h3>
                <div className="space-y-3">
                  {experience.map((exp) => (
                    <div key={exp.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-900">
                          {exp.role} — <span className="font-semibold text-slate-700">{exp.company}</span>
                        </span>
                        <span className="text-[11px] text-slate-500">{exp.duration}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-normal">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certificates */}
            {showCertificates && certificates.length > 0 && (
              <div className="mb-6">
                <h3
                  className="text-xs font-black uppercase tracking-wider mb-2"
                  style={{ color: accentColor }}
                >
                  Verified Credentials & Certificates
                </h3>
                <div className="space-y-1.5">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-extrabold text-slate-900">{cert.title}</span>
                        <span className="text-slate-500"> • {cert.issuer}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500">
                        <span>ID: {cert.certificate_id}</span>
                        <span>({cert.issue_date})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Courses */}
            {showCourses && completedCourses.length > 0 && (
              <div className="mb-4">
                <h3
                  className="text-xs font-black uppercase tracking-wider mb-2"
                  style={{ color: accentColor }}
                >
                  Continuous Learning & Courses Completed
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                  {completedCourses.map((c) => (
                    <div key={c.id} className="truncate">
                      • <span className="font-bold text-slate-900">{c.title}</span> ({c.provider})
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Official EkJagah Footer Stamp */}
            <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <img src="/logo.png" alt="EkJagah" className="w-3.5 h-3.5 rounded-full object-cover" />
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Verified Candidate Profile • EkJagah Career Platform</span>
              </div>
              <span>Generated on {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
