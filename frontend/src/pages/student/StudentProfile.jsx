import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  User,
  School,
  GraduationCap,
  Sparkles,
  FileText,
  Upload,
  Link as LinkIcon,
  Code2,
  Share2,
  Globe,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ClipboardCheck,
  ArrowRight,
  FolderGit2,
  ExternalLink,
  Phone,
  MapPin,
  Star,
  Terminal,
  Edit3,
  Trash2,
  Calendar
} from 'lucide-react';

export const StudentProfile = () => {
  const { refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Profile state
  const [fullName, setFullName] = useState('');
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [targetCareerRole, setTargetCareerRole] = useState('Full Stack Developer');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [leetcodeUrl, setLeetcodeUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [completion, setCompletion] = useState(30);

  // Technical skills: list of { name, level }
  const [technicalSkills, setTechnicalSkills] = useState([]);
  const [verifiedSkills, setVerifiedSkills] = useState([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');

  // Soft skills: list of strings
  const [softSkills, setSoftSkills] = useState([]);
  const [newSoftSkill, setNewSoftSkill] = useState('');

  // Projects state
  const [projects, setProjects] = useState([]);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [projectSaving, setProjectSaving] = useState(false);
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get('/student/profile');
        const p = res.data.profile;
        setFullName(p.full_name || '');
        setCollege(p.college || '');
        setBranch(p.branch || '');
        setCgpa(p.cgpa || '');
        setGraduationYear(p.graduation_year || '');
        setTargetCareerRole(p.target_career_role || 'Full Stack Developer');
        setPhone(p.phone || '');
        setLocation(p.location || '');
        setPortfolioUrl(p.portfolio_url || '');
        setGithubUrl(p.github_url || '');
        setLinkedinUrl(p.linkedin_url || '');
        setLeetcodeUrl(p.leetcode_url || '');
        setTwitterUrl(p.twitter_url || '');
        setResumeUrl(p.resume_url || '');
        setCompletion(p.profile_completion || 30);
        setTechnicalSkills(p.technical_skills || []);
        setVerifiedSkills(p.verified_skills || []);
        setSoftSkills(p.soft_skills || []);
        setProjects(p.projects || []);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleAddTechnicalSkill = (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    if (technicalSkills.some(s => s.name.toLowerCase() === newSkillName.trim().toLowerCase())) {
      return;
    }
    setTechnicalSkills([...technicalSkills, { name: newSkillName.trim(), level: newSkillLevel }]);
    setNewSkillName('');
  };

  const handleRemoveTechnicalSkill = (name) => {
    setTechnicalSkills(technicalSkills.filter(s => s.name !== name));
  };

  const handleAddSoftSkill = (e) => {
    e.preventDefault();
    if (!newSoftSkill.trim()) return;
    if (softSkills.includes(newSoftSkill.trim())) return;
    setSoftSkills([...softSkills, newSoftSkill.trim()]);
    setNewSoftSkill('');
  };

  const handleRemoveSoftSkill = (skill) => {
    setSoftSkills(softSkills.filter(s => s !== skill));
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please select a PDF document.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    try {
      setUploadingResume(true);
      setError('');
      const res = await api.post('/student/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResumeUrl(res.data.resumeUrl);
      setCompletion(res.data.profileCompletion);
      setMessage('Resume uploaded successfully!');
      await refreshUser();
      if (res.data.profileCompletion >= 100) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload resume.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const res = await api.put('/student/profile', {
        fullName,
        college,
        branch,
        cgpa,
        graduationYear,
        targetCareerRole,
        phone,
        location,
        portfolioUrl,
        githubUrl,
        linkedinUrl,
        leetcodeUrl,
        twitterUrl,
        technicalSkills,
        softSkills,
        projects
      });

      setCompletion(res.data.profileCompletion);
      setMessage('Profile updated successfully!');
      await refreshUser();
      if (res.data.profileCompletion >= 100) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  // Projects management helpers
  const openAddProjectModal = () => {
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
    setIsProjectModalOpen(true);
  };

  const openEditProjectModal = (p) => {
    setEditingProjectId(p.id);
    setProjectForm({
      title: p.title || '',
      role: p.role || 'Solo Developer',
      startDate: p.startDate || '',
      endDate: p.endDate || 'Present',
      description: p.description || '',
      techStack: Array.isArray(p.techStack) ? p.techStack : (typeof p.techStack === 'string' ? p.techStack.split(',').map(s => s.trim()).filter(Boolean) : []),
      techInput: '',
      bullets: Array.isArray(p.bullets) && p.bullets.length > 0 ? p.bullets : [''],
      githubLink: p.githubLink || p.githubUrl || '',
      liveDemoLink: p.liveDemoLink || p.liveUrl || '',
      featured: p.featured !== undefined ? p.featured : true
    });
    setIsProjectModalOpen(true);
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

  const handleRemoveProjectTag = (tagToRemove) => {
    setProjectForm({
      ...projectForm,
      techStack: projectForm.techStack.filter(t => t !== tagToRemove)
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

  const handleSaveProjectModal = async (e) => {
    e.preventDefault();
    if (!projectForm.title.trim()) {
      setError('Please provide a project title.');
      return;
    }

    try {
      setProjectSaving(true);
      setError('');

      const payload = {
        title: projectForm.title.trim(),
        role: projectForm.role.trim(),
        startDate: projectForm.startDate.trim(),
        endDate: projectForm.endDate.trim(),
        description: projectForm.description.trim(),
        techStack: projectForm.techStack,
        bullets: projectForm.bullets.filter(b => b.trim().length > 0),
        githubLink: projectForm.githubLink.trim(),
        liveDemoLink: projectForm.liveDemoLink.trim(),
        featured: projectForm.featured
      };

      if (editingProjectId) {
        const res = await api.put(`/student/projects/${editingProjectId}`, payload);
        setProjects(res.data.projects);
        setMessage('Project updated successfully!');
      } else {
        const res = await api.post('/student/projects', payload);
        setProjects(res.data.projects);
        setCompletion(res.data.profileCompletion);
        setMessage('Project added successfully!');
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      }

      setIsProjectModalOpen(false);
      await refreshUser();
      setTimeout(() => setMessage(''), 3500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save project.');
    } finally {
      setProjectSaving(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to remove this project?')) return;
    try {
      const res = await api.delete(`/student/projects/${id}`);
      setProjects(res.data.projects);
      setCompletion(res.data.profileCompletion);
      setMessage('Project removed successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to delete project.');
    }
  };

  const handleToggleFeatured = async (id) => {
    const proj = projects.find(p => p.id === id);
    if (!proj) return;
    const newFeatured = !proj.featured;
    try {
      const res = await api.put(`/student/projects/${id}`, { featured: newFeatured });
      setProjects(res.data.projects);
    } catch (err) {
      console.error('Failed to toggle featured state:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Student Profile & Portfolio
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {fullName || 'Student Profile'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Keep your skills, resume, and educational milestones updated for accurate AI matching.
          </p>
        </div>

        {/* Completion Widget */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 min-w-[200px] text-center">
          <span className="text-xs font-bold text-slate-500 block mb-1">Profile Strength</span>
          <div className="text-3xl font-black text-emerald-600 mb-2">{completion}%</div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${completion}%` }}
            ></div>
          </div>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* Education & Personal Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <School className="w-5 h-5 text-brand-600" />
            Education & Career Aspirations
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Career Goal (Drives AI Analyzer)
              </label>
              <select
                value={targetCareerRole}
                onChange={(e) => setTargetCareerRole(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none font-bold text-brand-700"
              >
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Engineer">Backend Engineer</option>
                <option value="AI & Machine Learning Engineer">AI & Machine Learning Engineer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="Cloud & DevOps Engineer">Cloud & DevOps Engineer</option>
                <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
                <option value="Mobile App Developer">Mobile App Developer</option>
                <option value="UI/UX Designer">UI/UX Designer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                College / University
              </label>
              <input
                type="text"
                required
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Branch / Major
              </label>
              <input
                type="text"
                required
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                CGPA / Percentage
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                placeholder="8.75"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Graduation Year
              </label>
              <input
                type="number"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                placeholder="2026"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Verified Skills & Assessments Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Verified Skills & Assessments
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Standardized test benchmarks validated by EkJagah. Verified skills boost recruiter search visibility.
              </p>
            </div>
            <Link
              to="/student/assessment"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition self-start sm:self-auto"
            >
              <ClipboardCheck className="w-4 h-4 text-indigo-600" />
              <span>Take Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {verifiedSkills.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-2">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800">No Verified Skills Yet</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1 mb-3">
                Prove your skills with a quick 15-question benchmark in Python, JavaScript, React, SQL, or DSA.
              </p>
              <Link
                to="/student/assessment"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition"
              >
                <span>Browse Assessments</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {verifiedSkills.map((vs, idx) => {
                const isExpert = vs.verdict?.toLowerCase() === 'expert';
                const isProficient = vs.verdict?.toLowerCase() === 'proficient';
                const badgeColor = isExpert 
                  ? 'bg-purple-50 border-purple-200 text-purple-700'
                  : isProficient
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700';

                return (
                  <div
                    key={vs.skillId || idx}
                    className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-indigo-200 transition flex flex-col justify-between relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{vs.skillName || vs.skillId}</h4>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          Level: {vs.level}
                        </span>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                        {vs.verdict || 'Competent'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-200/60 text-xs">
                      <div className="flex items-center gap-1 text-emerald-600 font-extrabold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Score: {vs.percentage}%</span>
                      </div>
                      {vs.verifiedAt && (
                        <span className="text-[10px] text-slate-400">
                          {new Date(vs.verifiedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Technical Skills Manager */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              Technical Skills & Proficiencies
            </h2>
            <span className="text-xs text-slate-400">{technicalSkills.length} skills listed</span>
          </div>

          {/* Add skill input row */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="e.g. React, PostgreSQL, Docker, Python"
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <select
              value={newSkillLevel}
              onChange={(e) => setNewSkillLevel(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
            <button
              type="button"
              onClick={handleAddTechnicalSkill}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Skill</span>
            </button>
          </div>

          {/* Active Skills Chips */}
          <div className="flex flex-wrap gap-2 pt-2">
            {technicalSkills.length === 0 ? (
              <p className="text-xs text-slate-400">No technical skills added yet. Add at least 3 skills to boost matching.</p>
            ) : (
              technicalSkills.map((s) => (
                <span
                  key={s.name}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800"
                >
                  <span>{s.name}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-slate-500 border border-slate-200">
                    {s.level}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTechnicalSkill(s.name)}
                    className="text-slate-400 hover:text-rose-500 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Soft Skills Manager */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            Soft Skills & Attributes
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={newSoftSkill}
              onChange={(e) => setNewSoftSkill(e.target.value)}
              placeholder="e.g. Problem Solving, Public Speaking, Agile Delivery"
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddSoftSkill}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {softSkills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-800"
              >
                <span>{s}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSoftSkill(s)}
                  className="text-indigo-400 hover:text-rose-500 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Engineering Projects Portfolio */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-indigo-600" />
                  <span>Engineering & Academic Projects</span>
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                  {projects.length}
                </span>
                {projects.filter(p => p.featured).length > 0 && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    <span>{projects.filter(p => p.featured).length} Featured on Resume</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Showcase production-grade projects, hackathon prototypes, and academic research with code and demo links.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddProjectModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95 whitespace-nowrap self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Project</span>
            </button>
          </div>

          {/* Project Cards List */}
          {projects.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 shadow-inner">
                <FolderGit2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Projects Added Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                Adding your key projects highlights your real-world coding capability to recruiters and pre-populates your verified resume.
              </p>
              <button
                type="button"
                onClick={openAddProjectModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Your First Project</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white transition shadow-sm hover:shadow-md space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center flex-wrap gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{proj.title}</h3>
                      {proj.role && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {proj.role}
                        </span>
                      )}
                      {(proj.startDate || proj.endDate) && (
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>
                            {proj.startDate} {proj.startDate && proj.endDate ? '–' : ''} {proj.endDate}
                          </span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(proj.id)}
                        title={proj.featured ? 'Featured on resume (Click to unfeature)' : 'Click to feature on resume'}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition border ${
                          proj.featured
                            ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                            : 'bg-white text-slate-400 border-slate-200 hover:text-amber-600 hover:border-amber-200'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${proj.featured ? 'fill-amber-400 text-amber-500' : ''}`} />
                        <span>{proj.featured ? 'Featured' : 'Feature'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditProjectModal(proj)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit project"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteProject(proj.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {proj.description && (
                    <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>
                  )}

                  {/* Bullets */}
                  {Array.isArray(proj.bullets) && proj.bullets.length > 0 && (
                    <ul className="space-y-1 text-xs text-slate-700 pl-4 list-disc">
                      {proj.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}

                  {/* Tech stack tags */}
                  {Array.isArray(proj.techStack) && proj.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {proj.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 font-mono"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Links */}
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-200/60 text-xs">
                    {proj.githubLink && (
                      <a
                        href={proj.githubLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-semibold hover:underline"
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Source Code</span>
                      </a>
                    )}
                    {proj.liveDemoLink && (
                      <a
                        href={proj.liveDemoLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-800 font-semibold hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Live Demo</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resume & Portfolio Links */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-600" />
              Resume & Contact Links
            </h2>
            <Link
              to="/student/resume"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
            >
              <span>Open Resume Builder</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* EkJagah Verified Resume Builder Promo Card */}
          <div className="p-4 bg-gradient-to-r from-brand-500/10 via-purple-500/10 to-indigo-500/10 rounded-2xl border border-brand-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Auto-Generated Verified Resume</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-100 text-brand-700 tracking-wider">
                    NEW ATS BUILDER
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pre-populated with verified test badges, approved certificates, completed courses, and projects.
                </p>
              </div>
            </div>
            <Link
              to="/student/resume"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition shadow-sm whitespace-nowrap"
            >
              <span>Generate Verified Resume</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Resume Upload Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-500 border border-slate-200 shadow-sm">
                <FileText className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  {resumeUrl ? 'Resume Uploaded (PDF)' : 'Upload External Custom Resume (PDF)'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {resumeUrl ? `Stored at ${resumeUrl}` : 'PDF format up to 10 MB'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {resumeUrl && (
                <a
                  href={`http://localhost:5001${resumeUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 text-xs font-bold text-brand-600 hover:bg-brand-50 rounded-xl transition"
                >
                  View Current
                </a>
              )}
              <label className="cursor-pointer px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingResume ? 'Uploading...' : resumeUrl ? 'Replace PDF' : 'Upload PDF'}</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleResumeUpload}
                  disabled={uploadingResume}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Contact & Social Links Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Contact & Online Profiles
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>Phone Number</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>City / Location</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bengaluru, India"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>GitHub Profile</span>
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>LinkedIn Profile</span>
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <span>Portfolio Website</span>
                </label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://myportfolio.dev"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                  <span>LeetCode / Coding Profile</span>
                </label>
                <input
                  type="url"
                  value={leetcodeUrl}
                  onChange={(e) => setLeetcodeUrl(e.target.value)}
                  placeholder="https://leetcode.com/u/..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span>Twitter / X Profile</span>
                </label>
                <input
                  type="url"
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  placeholder="https://x.com/..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition active:scale-95 disabled:opacity-50"
          >
            {saving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>

      {/* Project Add / Edit Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-indigo-600" />
                  <span>{editingProjectId ? 'Edit Project' : 'Add New Project'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter details, tech stack tags, and achievement impact bullets.
                </p>
              </div>
              <button
                onClick={() => setIsProjectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProjectModal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI-Powered Medical Diagnostic Tool"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Role
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Solo Developer, Team Lead, Backend Engineer"
                    value={projectForm.role}
                    onChange={(e) => setProjectForm({ ...projectForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jan 2026"
                    value={projectForm.startDate}
                    onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    End Date
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="e.g. May 2026 or Present"
                      value={projectForm.endDate}
                      onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setProjectForm({ ...projectForm, endDate: 'Present' })}
                      className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                    >
                      Present
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Summarize the project's purpose and architecture in 2-3 lines..."
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Tech Stack Chips Manager */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Technologies / Tech Stack (Press Enter or comma to add)
                </label>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap gap-1.5 items-center min-h-[42px]">
                  {projectForm.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 shadow-sm"
                    >
                      <span>{tech}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProjectTag(tech)}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder={projectForm.techStack.length === 0 ? "Type a skill e.g. React and hit Enter..." : "Add more..."}
                    value={projectForm.techInput}
                    onChange={(e) => setProjectForm({ ...projectForm, techInput: e.target.value })}
                    onKeyDown={handleAddProjectTag}
                    className="flex-1 min-w-[120px] bg-transparent text-xs focus:outline-none px-1"
                  />
                </div>
                {/* Quick Add Suggestions */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[11px] text-slate-400 font-semibold">Quick add:</span>
                  {['React', 'Node.js', 'Python', 'TypeScript', 'SQL', 'MongoDB', 'Docker', 'TailwindCSS'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleQuickAddTag(tag)}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 transition"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Impact / Achievement Bullets */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Achievement & Impact Points (Recommended for ATS)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddBullet}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Bullet</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {projectForm.bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono">•</span>
                      <input
                        type="text"
                        placeholder="e.g. Optimized SQL queries reducing average response time by 40%"
                        value={bullet}
                        onChange={(e) => handleBulletChange(idx, e.target.value)}
                        className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveBullet(idx)}
                        className="p-2 text-slate-400 hover:text-rose-500 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>GitHub Repository URL</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/username/project"
                    value={projectForm.githubLink}
                    onChange={(e) => setProjectForm({ ...projectForm, githubLink: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    <span>Live Demo URL</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://myproject-demo.com"
                    value={projectForm.liveDemoLink}
                    onChange={(e) => setProjectForm({ ...projectForm, liveDemoLink: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Featured toggle */}
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className={`w-4 h-4 ${projectForm.featured ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Feature on Resume</span>
                    <span className="text-[11px] text-slate-500">Surface this project in your auto-generated resume by default</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={projectForm.featured}
                  onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })}
                  className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={projectSaving}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {projectSaving ? 'Saving...' : editingProjectId ? 'Update Project' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
