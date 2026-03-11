import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Eye, Search, Filter, Save, X } from 'lucide-react';
import EmptyState from '../../components/EmptyState';
import SkeletonCard from '../../components/SkeletonCard';

const CATEGORIES = ['climate', 'biodiversity', 'water', 'energy', 'waste', 'pollution', 'general'];
const TYPES = ['lesson', 'article', 'video', 'guide'];
const STATUSES = ['draft', 'review', 'published', 'archived'];
const GRADES = Array.from({ length: 12 }, (_, i) => i + 1);
const NCERT_TAGS = [
    'EVS Class 3-5', 'Science Class 6-8', 'Biology Class 9-10',
    'Environmental Studies', 'Geography', 'Climate Change',
    'Ecosystem', 'Pollution', 'Conservation', 'Sustainable Development',
    'Water Cycle', 'Forest Ecosystem', 'Biodiversity', 'Renewable Energy'
];

const AdminCMS = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [showEditor, setShowEditor] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form, setForm] = useState({
        type: 'lesson',
        title: '',
        body: '',
        summary: '',
        category: 'general',
        gradeLevel: [],
        ncertAlignmentTags: [],
        language: 'en',
        status: 'draft'
    });

    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            if (activeTab !== 'all') params.status = activeTab;
            if (search) params.search = search;

            // Use the content API if available, otherwise fallback
            const res = await axios.get('/api/content', { params });
            setItems(res.data.data || []);
        } catch (err) {
            // Fallback: no API yet, use empty
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [activeTab, search]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const openEditor = (item = null) => {
        if (item) {
            setEditingItem(item);
            setForm({
                type: item.type || 'lesson',
                title: item.title || '',
                body: item.body || '',
                summary: item.summary || '',
                category: item.category || 'general',
                gradeLevel: item.gradeLevel || [],
                ncertAlignmentTags: item.ncertAlignmentTags || [],
                language: item.language || 'en',
                status: item.status || 'draft'
            });
        } else {
            setEditingItem(null);
            setForm({
                type: 'lesson', title: '', body: '', summary: '',
                category: 'general', gradeLevel: [], ncertAlignmentTags: [],
                language: 'en', status: 'draft'
            });
        }
        setShowEditor(true);
    };

    const closeEditor = () => {
        setShowEditor(false);
        setEditingItem(null);
    };

    const handleSave = async () => {
        try {
            if (editingItem) {
                await axios.put(`/api/content/${editingItem._id}`, form);
            } else {
                await axios.post('/api/content', form);
            }
            closeEditor();
            fetchItems();
        } catch (err) {
            console.error('Save failed:', err);
        }
    };

    const toggleGrade = (grade) => {
        setForm(prev => ({
            ...prev,
            gradeLevel: prev.gradeLevel.includes(grade)
                ? prev.gradeLevel.filter(g => g !== grade)
                : [...prev.gradeLevel, grade]
        }));
    };

    const toggleTag = (tag) => {
        setForm(prev => ({
            ...prev,
            ncertAlignmentTags: prev.ncertAlignmentTags.includes(tag)
                ? prev.ncertAlignmentTags.filter(t => t !== tag)
                : [...prev.ncertAlignmentTags, tag]
        }));
    };

    // Status tab colors
    const tabColor = (tab) => {
        if (tab === activeTab) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        return 'bg-[var(--s1)]/[0.02] text-white/40 border-white/5 hover:text-white/60';
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">Content Management</h1>
                        <p className="text-white/40 text-sm mt-1">Create and manage lessons, articles, and educational content</p>
                    </div>
                    <button
                        onClick={() => openEditor()}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                       bg-gradient-to-r from-emerald-500 to-teal-500 text-white
                       hover:from-emerald-400 hover:to-teal-400 transition-all
                       shadow-lg shadow-emerald-500/20"
                    >
                        <Plus className="w-4 h-4" />
                        New Content
                    </button>
                </div>

                {/* Tabs + Search */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    {['all', ...STATUSES].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-colors ${tabColor(tab)}`}
                        >
                            {tab}
                        </button>
                    ))}
                    <div className="flex-1" />
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                            type="text"
                            placeholder="Search content..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 rounded-lg bg-[var(--s1)]/5 border border-white/10
                         text-sm text-white placeholder-white/30 outline-none w-64
                         focus:border-emerald-500/30 transition-colors"
                        />
                    </div>
                </div>

                {/* Content Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <SkeletonCard variant="card" count={6} />
                    </div>
                ) : items.length === 0 ? (
                    <EmptyState
                        title="No content yet"
                        description="Create your first lesson, article, or guide to get started with the CMS."
                        actionLabel="Create Content"
                        onAction={() => openEditor()}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.map(item => (
                            <div
                                key={item._id}
                                className="rounded-xl border border-white/5 bg-[var(--s1)]/[0.02] p-4
                           hover:border-white/10 transition-all cursor-pointer"
                                onClick={() => openEditor(item)}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-[var(--s1)]/5 text-white/50 capitalize">
                                        {item.type}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' :
                                        item.status === 'review' ? 'bg-amber-500/10 text-amber-400' :
                                            'bg-[var(--s1)]/5 text-white/40'
                                        }`}>
                                        {item.status}
                                    </span>
                                </div>
                                <h3 className="text-sm font-semibold text-white/90 mb-1 line-clamp-2">{item.title}</h3>
                                <p className="text-xs text-white/40 line-clamp-2 mb-3">{item.summary}</p>
                                <div className="flex items-center gap-2 text-xs text-white/30">
                                    <span>{item.readTimeMinutes || 5} min read</span>
                                    <span>·</span>
                                    <span className="capitalize">{item.category}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Editor Modal */}
                {showEditor && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto">
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeEditor} role="button" tabIndex={0} aria-label="Close Editor" onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && closeEditor()} />
                        <div className="relative w-full max-w-3xl bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold">
                                    {editingItem ? 'Edit Content' : 'New Content'}
                                </h2>
                                <button onClick={closeEditor} className="p-1.5 rounded-lg bg-[var(--s1)]/5 text-white/40 hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Type + Status */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-white/40 mb-1">Type</label>
                                        <select
                                            value={form.type}
                                            onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                                            className="w-full px-3 py-2 rounded-lg bg-[var(--s1)]/5 border border-white/10 text-sm text-white outline-none"
                                        >
                                            {TYPES.map(t => <option key={t} value={t} className="bg-gray-900">{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-white/40 mb-1">Status</label>
                                        <select
                                            value={form.status}
                                            onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
                                            className="w-full px-3 py-2 rounded-lg bg-[var(--s1)]/5 border border-white/10 text-sm text-white outline-none"
                                        >
                                            {STATUSES.map(s => <option key={s} value={s} className="bg-gray-900">{s}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="block text-xs font-medium text-white/40 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Lesson title..."
                                        className="w-full px-3 py-2 rounded-lg bg-[var(--s1)]/5 border border-white/10 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-500/30"
                                    />
                                </div>

                                {/* Summary */}
                                <div>
                                    <label className="block text-xs font-medium text-white/40 mb-1">Summary</label>
                                    <input
                                        type="text"
                                        value={form.summary}
                                        onChange={(e) => setForm(prev => ({ ...prev, summary: e.target.value }))}
                                        placeholder="Brief summary..."
                                        className="w-full px-3 py-2 rounded-lg bg-[var(--s1)]/5 border border-white/10 text-sm text-white placeholder-white/30 outline-none"
                                    />
                                </div>

                                {/* Body */}
                                <div>
                                    <label className="block text-xs font-medium text-white/40 mb-1">Content Body</label>
                                    <textarea
                                        value={form.body}
                                        onChange={(e) => setForm(prev => ({ ...prev, body: e.target.value }))}
                                        placeholder="Write your content here... (Markdown supported)"
                                        rows={8}
                                        className="w-full px-3 py-2 rounded-lg bg-[var(--s1)]/5 border border-white/10 text-sm text-white placeholder-white/30 outline-none font-mono resize-y"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-xs font-medium text-white/40 mb-1">Category</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-lg bg-[var(--s1)]/5 border border-white/10 text-sm text-white outline-none"
                                    >
                                        {CATEGORIES.map(c => <option key={c} value={c} className="bg-gray-900 capitalize">{c}</option>)}
                                    </select>
                                </div>

                                {/* Grade Level */}
                                <div>
                                    <label className="block text-xs font-medium text-white/40 mb-1.5">Grade Levels</label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {GRADES.map(g => (
                                            <button
                                                key={g}
                                                onClick={() => toggleGrade(g)}
                                                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors
                          ${form.gradeLevel.includes(g)
                                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                        : 'bg-[var(--s1)]/5 text-white/40 border border-white/5 hover:text-white/60'
                                                    }`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* NCERT Tags */}
                                <div>
                                    <label className="block text-xs font-medium text-white/40 mb-1.5">NCERT Curriculum Tags</label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {NCERT_TAGS.map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => toggleTag(tag)}
                                                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors
                          ${form.ncertAlignmentTags.includes(tag)
                                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                        : 'bg-[var(--s1)]/5 text-white/30 border border-white/5 hover:text-white/50'
                                                    }`}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Save */}
                                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                    <button
                                        onClick={closeEditor}
                                        className="px-4 py-2 rounded-lg text-sm text-white/50 hover:text-white bg-[var(--s1)]/5 hover:bg-[var(--s1)]/10 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={!form.title || !form.body}
                                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold
                               bg-gradient-to-r from-emerald-500 to-teal-500 text-white
                               hover:from-emerald-400 hover:to-teal-400 transition-all
                               disabled:opacity-40 disabled:cursor-not-allowed
                               shadow-lg shadow-emerald-500/20"
                                    >
                                        <Save className="w-4 h-4" />
                                        {editingItem ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCMS;
