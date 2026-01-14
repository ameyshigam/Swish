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
        <div className="space-y-8">
            {/* High Priority: Flagged Posts */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg shadow-red-500/20">
                        <AlertTriangle className="text-white" size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Flagged Posts</h2>
                        <p className="text-sm text-muted-foreground">{flaggedPosts.length} posts require attention</p>
                    </div>
                </div>
                <div className="neo-card overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-destructive/10 border-b border-destructive/20">
                                <th className="p-4 font-semibold text-foreground">Post Subject/Content</th>
                                <th className="p-4 font-semibold text-foreground">Author</th>
                                <th className="p-4 font-semibold text-foreground">Report Count</th>
                                <th className="p-4 font-semibold text-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {flaggedPosts.length === 0 ? (
                                <tr><td colSpan="4" className="p-6 text-center text-muted-foreground">No flagged posts</td></tr>
                            ) : (
                                flaggedPosts.map(post => {
                                    const count = postReportCounts[post._id];
                                    const isHighRisk = count >= 5;
                                    return (
                                        <tr key={post._id} className={`border-b border-border ${isHighRisk ? 'bg-destructive/10' : ''}`}>
                                            <td className="p-4 max-w-md truncate text-foreground">
                                                {post.content || post.caption || 'No content'}
                                            </td>
                                            <td className="p-4 text-muted-foreground">
                                                {/* Author info might need population or lookup */}
                                                User ID: {post.authorId}
                                            </td>
                                            <td className="p-4 font-bold text-destructive">
                                                {count} {isHighRisk && '(Auto-Removal Recommended)'}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handleDeletePost(post._id)}
                                                    className="px-3 py-1 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-colors text-sm font-medium"
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
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-primary to-purple-600 rounded-xl shadow-lg shadow-primary/20">
                        <Eye className="text-white" size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">All Reports</h2>
                        <p className="text-sm text-muted-foreground">{reports.length} total reports</p>
                    </div>
                </div>
                <div className="neo-card overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border">
                                <th className="p-4 font-semibold text-muted-foreground">Type</th>
                                <th className="p-4 font-semibold text-muted-foreground">Reason</th>
                                <th className="p-4 font-semibold text-muted-foreground">Description</th>
                                <th className="p-4 font-semibold text-muted-foreground">Status</th>
                                <th className="p-4 font-semibold text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map(report => (
                                <tr key={report._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                                    <td className="p-4 capitalize text-foreground">{report.type}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-muted rounded text-xs font-medium text-muted-foreground">{report.reason}</span>
                                    </td>
                                    <td className="p-4 text-sm text-muted-foreground max-w-xs truncate">{report.description}</td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${report.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                            }`}>
                                            {report.status || 'pending'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        {report.status !== 'resolved' && (
                                            <button
                                                onClick={() => handleUpdateReport(report._id, 'resolved')}
                                                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium text-sm flex items-center gap-1 justify-end w-full"
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