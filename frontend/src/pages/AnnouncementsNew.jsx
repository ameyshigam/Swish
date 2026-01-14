import React, { useEffect, useState } from 'react';
import axios from 'axios';
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

const Announcements = () => {
  const [items, setItems] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();

  const getServerUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${import.meta.env.VITE_SERVER_URL || 'http://localhost:5001'}${path}`;
  };

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

  const { success, error } = useToast();

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
      // 1. Always add to Latest announcements (everything shows here)
      if (g['Latest announcements']) {
        g['Latest announcements'].push(it);
      }

      // 2. Add to specific category if it's NOT 'Latest announcements'
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
      // reset
      setPriority('Medium');
      setSubject('');
      setDescription('');
      setCategory(CATEGORIES[0]);
      setTargetSection('');
      setFile(null);
      setShowForm(false);
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || 'Failed to post announcement');
    } finally {
      setSubmitting(false);
    }
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
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-teal-700">Announcements Dashboard</h1>
        {canPost && (
          <button
            onClick={() => setShowForm((s) => !s)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
          >
            {showForm ? 'Close Form' : 'Post Announcement'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500">
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            {category === 'Scholarship Section' && (
              <div>
                <label className="block text-sm font-medium mb-1">Target Section</label>
                <input
                  type="text"
                  value={targetSection}
                  onChange={e => setTargetSection(e.target.value)}
                  placeholder="e.g. Section A"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500"
              placeholder="Enter subject..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500 h-20"
              placeholder="Enter details..."
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Attachment (PDF/Image)</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-teal-50 file:text-teal-700
                  hover:file:bg-teal-100"
            />
          </div>

          <button
            disabled={submitting}
            className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {submitting ? 'Posting...' : 'Post Announcement'}
          </button>
        </form>
      )}

      {/* Main Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Latest Announcements (Takes 1 column width) */}
        <div className="lg:col-span-1">
          {CATEGORIES.filter(c => c === 'Latest announcements').map(cat => (
            <div key={cat} className="bg-white rounded-lg shadow overflow-hidden flex flex-col h-[calc(100vh-12rem)] border-t-4 border-teal-600">
              <div className="p-3 bg-teal-50 border-b flex justify-between items-center">
                <h3 className="font-bold text-teal-800 flex items-center gap-2">
                  {cat}
                </h3>
              </div>
              <div className="p-4 flex-1 overflow-y-auto">
                {grouped[cat]?.length === 0 ? (
                  <p className="text-gray-400 text-sm italic">No updates</p>
                ) : (
                  <ul className="space-y-3">
                    {grouped[cat]?.map(item => (
                      <li key={item._id} className="text-sm border-b border-dashed border-gray-200 pb-2 last:border-0">
                        <div className="flex justify-between items-start">
                          <div>
                            {item.fileUrl ? (
                              <a
                                href={getServerUrl(item.fileUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-blue-600 hover:underline block mb-1"
                              >
                                {item.subject}
                              </a>
                            ) : (
                              <span className="font-medium text-gray-800 block mb-1">{item.subject}</span>
                            )}

                            {item.description && (
                              <p className="text-gray-500 text-xs line-clamp-2">{item.description}</p>
                            )}
                            <span className="text-xs text-gray-400 block mt-1">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {canPost && (
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="text-red-400 hover:text-red-600 ml-2"
                              title="Delete"
                            >
                              &times;
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Other Categories in 2x2 Grid (Takes 2 column widths) */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 h-fit">
          {CATEGORIES.filter(c => c !== 'Latest announcements').map(cat => (
            <div key={cat} className="bg-white rounded-lg shadow overflow-hidden flex flex-col h-80 border-t-4 border-teal-600">
              <div className="p-3 bg-teal-50 border-b flex justify-between items-center">
                <h3 className="font-bold text-teal-800 flex items-center gap-2">
                  {cat}
                </h3>
              </div>
              <div className="p-4 flex-1 overflow-y-auto">
                {grouped[cat]?.length === 0 ? (
                  <p className="text-gray-400 text-sm italic">No updates</p>
                ) : (
                  <ul className="space-y-3">
                    {grouped[cat]?.map(item => (
                      <li key={item._id} className="text-sm border-b border-dashed border-gray-200 pb-2 last:border-0">
                        <div className="flex justify-between items-start">
                          <div>
                            {item.fileUrl ? (
                              <a
                                href={getServerUrl(item.fileUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-blue-600 hover:underline block mb-1"
                              >
                                {item.subject}
                              </a>
                            ) : (
                              <span className="font-medium text-gray-800 block mb-1">{item.subject}</span>
                            )}

                            {item.description && (
                              <p className="text-gray-500 text-xs line-clamp-2">{item.description}</p>
                            )}
                            <span className="text-xs text-gray-400 block mt-1">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {canPost && (
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="text-red-400 hover:text-red-600 ml-2"
                              title="Delete"
                            >
                              &times;
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
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
