import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, CheckCircle, Trash2, Eye } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const AdminReports = () => {
    const [reports, setReports] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { success, error } = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [reportsRes, postsRes] = await Promise.all([
                axios.get('/admin/reports'),
                axios.get('/admin/posts') // We need all posts to check report counts if backend doesn't provide it
            ]);
            setReports(reportsRes.data);
            setPosts(postsRes.data);
        } catch (err) {
            console.error(err);
            error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateReport = async (reportId, status) => {
        try {
            await axios.put(`/admin/reports/${reportId}`, { status });
            setReports(reports.map(r => r._id === reportId ? { ...r, status } : r));
            success('Report updated');
        } catch (err) {
            console.error(err);
            error('Failed to update report');
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            await axios.delete(`/admin/posts/${postId}`);
            setPosts(posts.filter(p => p._id !== postId));
            success('Post removed');
        } catch (err) {
            console.error(err);
            error('Failed to delete post');
        }
    };

    // Calculate reports per post
    // Assuming reports have `postId`
    const postReportCounts = reports.reduce((acc, r) => {
        if (r.type === 'post' && r.postId) {
            acc[r.postId] = (acc[r.postId] || 0) + 1;
        }
        return acc;
    }, {});

    // Filter posts with reports
    const flaggedPosts = posts.filter(p => postReportCounts[p._id] > 0)
        .sort((a, b) => (postReportCounts[b._id] || 0) - (postReportCounts[a._id] || 0));

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* High Priority: Flagged Posts */}
            <div>
                <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
                    <AlertTriangle className="text-red-500" />
                    Flagged Posts (High Priority)
                    </h2>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-red-50 border-b border-red-100">
                                <th className="p-4 font-semibold text-slate-700">Post Subject/Content</th>
                                <th className="p-4 font-semibold text-slate-700">Author</th>
                                <th className="p-4 font-semibold text-slate-700">Report Count</th>
                                <th className="p-4 font-semibold text-slate-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {flaggedPosts.length === 0 ? (
                                <tr><td colSpan="4" className="p-6 text-center text-slate-500">No flagged posts</td></tr>
                            ) : (
                                flaggedPosts.map(post => {
                                    const count = postReportCounts[post._id];
                                    const isHighRisk = count >= 5;
                                    return (
                                        <tr key={post._id} className={`border-b border-slate-100 ${isHighRisk ? 'bg-red-50/50' : ''}`}>
                                            <td className="p-4 max-w-md truncate">
                                                {post.content || post.caption || 'No content'}
                                            </td>
                                            <td className="p-4">
                                                {/* Author info might need population or lookup */}
                                                User ID: {post.authorId} 
                                            </td>
                                            <td className="p-4 font-bold text-red-600">
                                                {count} {isHighRisk && '(Auto-Removal Recommended)'}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button 
                                                    onClick={() => handleDeletePost(post._id)}
                                                    className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                                                >
                                                    Remove Post
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* All Reports List */}
            <div>
                <h2 className="text-xl font-bold text-slate-100 mb-4">All Reports</h2>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                    <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-4 font-semibold text-slate-600">Type</th>
                                <th className="p-4 font-semibold text-slate-600">Reason</th>
                                <th className="p-4 font-semibold text-slate-600">Description</th>
                                <th className="p-4 font-semibold text-slate-600">Status</th>
                                <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map(report => (
                                <tr key={report._id} className="border-b border-slate-100">
                                    <td className="p-4 capitalize">{report.type}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium">{report.reason}</span>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600 max-w-xs truncate">{report.description}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            report.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {report.status || 'pending'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        {report.status !== 'resolved' && (
                                            <button 
                                                onClick={() => handleUpdateReport(report._id, 'resolved')}
                                                className="text-green-600 hover:text-green-800 font-medium text-sm flex items-center gap-1 justify-end w-full"
                                            >
                                                <CheckCircle size={16} /> Mark Resolved
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminReports;