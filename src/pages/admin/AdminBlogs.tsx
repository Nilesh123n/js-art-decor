import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import { Blog } from '../../types/ecommerce';
import { ApiService } from '../../services/api';

interface AdminBlogsProps {
  blogs: Blog[];
  onRefreshBlogs: () => void;
}

export const AdminBlogs: React.FC<AdminBlogsProps> = ({ blogs, onRefreshBlogs }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Partial<Blog> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleOpenAdd = () => {
    setEditingBlog({
      title: '',
      slug: '',
      featured_image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
      short_description: '',
      full_content: '',
      category: 'Textile Guide',
      author: 'JSArt&Decor Editorial',
      status: 'Published'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (b: Blog) => {
    setEditingBlog({ ...b });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this blog post from MySQL?')) {
      try {
        await ApiService.saveAdminBlogs(blogs.filter(b => b.id !== id));
        onRefreshBlogs();
      } catch (err: any) {
        alert(err.message || 'Failed to delete blog.');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog || !editingBlog.title) return;

    setSubmitting(true);
    try {
      const slug = editingBlog.slug || editingBlog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const blogToSave: Blog = { ...editingBlog, slug } as Blog;

      const idx = blogs.findIndex(b => b.id === blogToSave.id);
      let updated = [...blogs];
      if (idx > -1) {
        updated[idx] = blogToSave;
      } else {
        updated.unshift(blogToSave);
      }

      await ApiService.saveAdminBlogs(updated);
      onRefreshBlogs();
      setModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save blog post.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-neutral-900">Blog Management</h1>
          <p className="text-xs text-neutral-500">Publish textile guides, care instructions, and industry updates to MySQL backend.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Blog Article</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {blogs.map(b => (
          <div key={b.id} className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {b.category}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">{(b.created_at || '').substring(0, 10)}</span>
              </div>

              <h2 className="text-sm font-bold text-neutral-900 line-clamp-1">{b.title}</h2>
              <p className="text-xs text-neutral-500 line-clamp-2">{b.short_description}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-neutral-100 text-xs">
              <span className="text-neutral-500">By {b.author}</span>
              <div className="flex gap-2">
                <button onClick={() => handleOpenEdit(b)} className="p-1.5 hover:bg-neutral-100 rounded text-neutral-700">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(b.id)} className="p-1.5 hover:bg-red-50 rounded text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && editingBlog && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white text-neutral-900 rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="font-bold text-neutral-900 text-base">
                  {editingBlog.id ? 'Edit Blog Article' : 'New Blog Article'}
                </h2>
                <p className="text-[11px] text-neutral-500">
                  Fill in article details to publish to the store blog.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs text-neutral-900">
              <div>
                <label className="block font-bold text-neutral-800 mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5 Secrets to Choosing Luxury 400 TC Bedding"
                  value={editingBlog.title ?? ''}
                  onChange={(e) => setEditingBlog(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full bg-white text-neutral-900 border border-neutral-300 rounded-lg p-2.5 font-medium placeholder:text-neutral-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Textile Guide, Decor Tips"
                    value={editingBlog.category ?? ''}
                    onChange={(e) => setEditingBlog(prev => prev ? { ...prev, category: e.target.value } : null)}
                    className="w-full bg-white text-neutral-900 border border-neutral-300 rounded-lg p-2.5 placeholder:text-neutral-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-800 mb-1">Author Name</label>
                  <input
                    type="text"
                    placeholder="e.g. JSArt&Decor Editorial"
                    value={editingBlog.author ?? ''}
                    onChange={(e) => setEditingBlog(prev => prev ? { ...prev, author: e.target.value } : null)}
                    className="w-full bg-white text-neutral-900 border border-neutral-300 rounded-lg p-2.5 placeholder:text-neutral-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">Featured Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={editingBlog.featured_image ?? ''}
                  onChange={(e) => setEditingBlog(prev => prev ? { ...prev, featured_image: e.target.value } : null)}
                  className="w-full bg-white text-neutral-900 border border-neutral-300 rounded-lg p-2.5 font-mono text-[11px] placeholder:text-neutral-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
                {editingBlog.featured_image && (
                  <div className="mt-2 relative h-28 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100">
                    <img
                      src={editingBlog.featured_image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">Short Summary</label>
                <textarea
                  rows={2}
                  placeholder="Brief synopsis shown on blog listing cards..."
                  value={editingBlog.short_description ?? ''}
                  onChange={(e) => setEditingBlog(prev => prev ? { ...prev, short_description: e.target.value } : null)}
                  className="w-full bg-white text-neutral-900 border border-neutral-300 rounded-lg p-2.5 placeholder:text-neutral-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">Full Content Body</label>
                <textarea
                  rows={6}
                  placeholder="Full article content and markdown..."
                  value={editingBlog.full_content ?? ''}
                  onChange={(e) => setEditingBlog(prev => prev ? { ...prev, full_content: e.target.value } : null)}
                  className="w-full bg-white text-neutral-900 border border-neutral-300 rounded-lg p-2.5 placeholder:text-neutral-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)} 
                  className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-100 transition font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Article</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
