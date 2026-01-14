import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bell, Calendar, Award, BookOpen, Zap, Plus, X, Trash2, FileText, Send, AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import ConfirmationModal from '../components/ConfirmationModal';

const CATEGORIES = [
  'Latest announcements',
  'Exam Notifications',
  'Scholarship Section',
  'Cultural Events',
  'IEEE & CSI'
];

const getCategoryIcon = (category) => {
  switch (category) {
    case 'Latest announcements': return <Bell size={18} className="text-blue-400" />;
    case 'Exam Notifications': return <AlertCircle size={18} className="text-red-400" />;
    case 'Scholarship Section': return <Award size={18} className="text-yellow-400" />;
    case 'Cultural Events': return <Calendar size={18} className="text-pink-400" />;
    case 'IEEE & CSI': return <Zap size={18} className="text-purple-400" />;
    default: return <BookOpen size={18} className="text-emerald-400" />;
  }
};

const getCategoryGradient = (category) => {
  switch (category) {
    case 'Latest announcements': return 'from-blue-500/20 to-cyan-500/20';
    case 'Exam Notifications': return 'from-red-500/20 to-orange-500/20';
    case 'Scholarship Section': return 'from-yellow-500/20 to-amber-500/20';
    case 'Cultural Events': return 'from-pink-500/20 to-rose-500/20';
    case 'IEEE & CSI': return 'from-purple-500/20 to-violet-500/20';
    default: return 'from-emerald-500/20 to-teal-500/20';
  }
};

const Announcements = () => {
  const [items, setItems] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const { success, error } = useToast();

  // form state
  const [priority, setPriority] = useState('Medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [targetSection, setTargetSection] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const getServerUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${import.meta.env.VITE_SERVER_URL || 'http://localhost:5001'}${path}`;
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/announcements');
        setItems(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    const g = CATEGORIES.reduce((acc, c) => ({ ...acc, [c]: [] }), {});
    items.forEach((it) => {
      // 1. Always add to Latest announcements
      if (g['Latest announcements']) {
        g['Latest announcements'].push(it);
      }

      // 2. Add to specific category
      const foundCat = CATEGORIES.find(c => c.toLowerCase() === (it.category || '').toLowerCase());
      if (foundCat && foundCat !== 'Latest announcements') {
        if (g[foundCat]) {
          g[foundCat].push(it);
        }
      }
    });
    setGrouped(g);
  }, [items]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim()) return error('Subject is required');
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('priority', priority);
      form.append('subject', subject);
      form.append('description', description);
      form.append('category', category);
      if (category === 'Scholarship Section' && targetSection) {
        form.append('targetSection', targetSection);
      }
      if (file) form.append('file', file);

      const res = await axios.post('/announcements', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      const created = res.data;
      setItems((prev) => [created, ...prev]);
      success('Announcement posted');
      resetForm();
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || 'Failed to post announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setPriority('Medium');
    setSubject('');
    setDescription('');
    setCategory(CATEGORIES[0]);
    setTargetSection('');
    setFile(null);
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/announcements/${deleteId}`);
      setItems(prev => prev.filter(i => i._id !== deleteId));
      success('Announcement deleted');
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (err) {
      console.error(err);
      error('Failed to delete');
    }
  };

  const canPost = user && (user.role === 'Admin' || user.role === 'Faculty');

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 relative">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Announcements</h1>
          <p className="text-muted-foreground mt-1">Stay updated with the latest campus news and notifications</p>
        </div>
        {canPost && (
          <button
            onClick={() => setShowForm((s) => !s)}
            className={`neo-button-primary rounded-xl flex items-center gap-2 ${showForm ? 'bg-red-500 hover:bg-red-600' : ''}`}
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
            {showForm ? 'Cancel Post' : 'New Announcement'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="glass-card p-6 md:p-8 animate-in slide-in-from-top-4 duration-300 border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Send size={20} className="text-primary" />
            Create New Announcement
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Category</label>
                <div className="relative">
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3 bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none">
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <BookOpen size={16} />
                  </div>
                </div>
              </div>

              {category === 'Scholarship Section' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-left-2">
                  <label className="text-sm font-medium text-muted-foreground">Target Section</label>
                  <input
                    type="text"
                    value={targetSection}
                    onChange={e => setTargetSection(e.target.value)}
                    placeholder="e.g. Section A"
                    className="w-full p-3 bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Priority</label>
                <div className="relative">
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full p-3 bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none">
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <AlertCircle size={16} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-3 bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                placeholder="Enter a concise subject..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[100px]"
                placeholder="Provide more details..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Attachment</label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 hover:bg-muted/30 transition-colors text-center cursor-pointer relative">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <FileText size={24} />
                  <span className="text-sm">{file ? file.name : "Click to upload PDF or Image"}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                disabled={submitting}
                className="neo-button-primary rounded-xl px-8 flex items-center gap-2"
              >
                {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={18} />}
                {submitting ? 'Posting...' : 'Post Announcement'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bento Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Latest Announcements - Main Card */}
        <div className="lg:col-span-4 lg:row-span-2">
          {CATEGORIES.filter(c => c === 'Latest announcements').map(cat => (
            <div key={cat} className="glass-card h-[calc(100vh-16rem)] min-h-[500px] flex flex-col relative overflow-hidden ring-1 ring-white/10">
              <div className={`absolute inset-0 bg-gradient-to-b ${getCategoryGradient(cat)} opacity-10 pointer-events-none`}></div>

              <div className="p-5 border-b border-border/50 flex items-center justify-between backdrop-blur-md bg-card/30 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {getCategoryIcon(cat)}
                  </div>
                  <h3 className="font-bold text-lg">{cat}</h3>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">Live</span>
              </div>

              <div className="flex-1 overflow-y-auto p-2 relative z-10 custom-scrollbar">
                {grouped[cat]?.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                    <Bell size={32} className="mb-2 opacity-20" />
                    <p className="text-sm">No recent updates</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {grouped[cat]?.map(item => (
                      <div key={item._id} className="group p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-default relative">
                        {/* Priority Indicator */}
                        {item.priority === 'High' && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>}

                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 grid gap-1">
                            {item.fileUrl ? (
                              <a
                                href={getServerUrl(item.fileUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 flex items-center gap-1"
                              >
                                {item.subject}
                                <FileText size={12} className="opacity-50" />
                              </a>
                            ) : (
                              <span className="font-semibold text-foreground line-clamp-1">{item.subject}</span>
                            )}

                            {item.description && (
                              <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">{item.description}</p>
                            )}

                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[10px] text-muted-foreground/60 bg-muted px-2 py-0.5 rounded-full">
                                {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                              {item.priority === 'High' && <span className="text-[10px] text-red-400 font-medium">Urgent</span>}
                            </div>
                          </div>

                          {canPost && (
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="text-muted-foreground hover:text-red-500 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Other Categories Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 content-start">
          {CATEGORIES.filter(c => c !== 'Latest announcements').map(cat => (
            <div key={cat} className="glass-card flex flex-col h-64 relative overflow-hidden group hover:ring-1 hover:ring-primary/30 transition-all">
              <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryGradient(cat)} opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`}></div>

              <div className="p-4 border-b border-border/50 flex justify-between items-center relative z-10 bg-card/30 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/5 rounded-md text-foreground/80">
                    {getCategoryIcon(cat)}
                  </div>
                  <h3 className="font-semibold text-foreground/90 text-sm">{cat}</h3>
                </div>
                {grouped[cat]?.length > 0 && (
                  <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full text-foreground/70">{grouped[cat]?.length}</span>
                )}
              </div>

              <div className="p-2 flex-1 overflow-y-auto custom-scrollbar relative z-10">
                {grouped[cat]?.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50">
                    <p className="text-xs">No updates</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {grouped[cat]?.map(item => (
                      <div key={item._id} className="p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group/item">
                        <div className="flex justify-between items-start">
                          <div>
                            {item.fileUrl ? (
                              <a
                                href={getServerUrl(item.fileUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-sm text-foreground group-hover/item:text-primary transition-colors line-clamp-1"
                              >
                                {item.subject}
                              </a>
                            ) : (
                              <span className="font-medium text-sm text-foreground line-clamp-1">{item.subject}</span>
                            )}
                            <span className="text-[10px] text-muted-foreground block mt-0.5">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {canPost && (
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="text-muted-foreground hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement? This action cannot be undone."
      />
    </div>
  );
};

export default Announcements;
