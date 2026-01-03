import React, { useState } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const Announcements = () => {
    const [priority, setPriority] = useState('Medium');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Examination');
    const [photo, setPhoto] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const { success, error } = useToast();

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
            if (photo) form.append('photo', photo);

            await axios.post('/announcements', form, {
                import React, { useEffect, useState } from 'react';
                import axios from 'axios';
                import { useToast } from '../context/ToastContext';

                const CATEGORIES = ['Examination', 'Cultural', 'Technical Clubs', 'Scholarship'];

                const Announcements = () => {
                    const [items, setItems] = useState([]);
                    const [grouped, setGrouped] = useState({});
                    const [showForm, setShowForm] = useState(false);

                    // form state
                    const [priority, setPriority] = useState('Medium');
                    const [subject, setSubject] = useState('');
                    const [description, setDescription] = useState('');
                    const [category, setCategory] = useState(CATEGORIES[0]);
                    const [photo, setPhoto] = useState(null);
                    const [submitting, setSubmitting] = useState(false);

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
                        items.forEach(it => {
                            const cat = CATEGORIES.includes(it.category) ? it.category : CATEGORIES[0];
                            g[cat].push(it);
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
                            if (photo) form.append('photo', photo);

                            const res = await axios.post('/announcements', form, { headers: { 'Content-Type': 'multipart/form-data' } });
                            const created = res.data;
                            setItems(prev => [created, ...prev]);
                            success('Announcement posted');
                            // reset
                            setPriority('Medium'); setSubject(''); setDescription(''); setCategory(CATEGORIES[0]); setPhoto(null);
                            setShowForm(false);
                        } catch (err) {
                            console.error(err);
                            error('Failed to post announcement');
                        } finally {
                            setSubmitting(false);
                        }
                    };

                    return (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h1 className="text-2xl font-semibold">Announcements</h1>
                                <button onClick={() => setShowForm(s => !s)} className="px-3 py-2 bg-slate-900 text-white rounded-lg">{showForm ? 'Close' : 'Post'}</button>
                            </div>

                            {showForm && (
                                <form onSubmit={handleSubmit} className="mb-6 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                        <div>
                                            <label className="block text-sm">Category</label>
                                            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border rounded">
                                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm">Priority</label>
                                            <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full p-2 border rounded">
                                                <option>High</option>
                                                <option>Medium</option>
                                                <option>Low</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm">Subject</label>
                                            <input value={subject} onChange={e => setSubject(e.target.value)} className="w-full p-2 border rounded" />
                                        </div>
                                    </div>

                                    <div className="mt-3">
                                        <label className="block text-sm">Description</label>
                                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full p-2 border rounded" />
                                    </div>

                                    <div className="mt-3 flex items-center gap-4">
                                        <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} />
                                        <button type="submit" disabled={submitting} className="px-4 py-2 bg-slate-900 text-white rounded">{submitting ? 'Posting...' : 'Post'}</button>
                                    </div>
                                </form>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {CATEGORIES.map(cat => (
                                    <div key={cat} className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                                        <h3 className="font-semibold mb-3">{cat}</h3>
                                        <div className="space-y-3">
                                            {(grouped[cat] || []).map(a => (
                                                <div key={a._id || a.id} className="p-3 border rounded">
                                                    <div className="flex items-start justify-between">
                                                        <p className="font-semibold">{a.subject}</p>
                                                        <span className="text-xs text-slate-500">{a.priority}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 mt-1">{a.description}</p>
                                                    {a.photo && <img src={a.photo.startsWith('/') ? a.photo : `/uploads/${a.photo}`} alt="ann" className="mt-2 w-full rounded" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                };

                export default Announcements;
