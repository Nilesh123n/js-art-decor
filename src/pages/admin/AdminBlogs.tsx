import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Loader2, 
  UploadCloud, 
  Image as ImageIcon, 
  Bold, 
  Italic, 
  Heading2, 
  Heading3, 
  List, 
  Quote, 
  CornerDownLeft, 
  Eye, 
  FileEdit,
  CheckCircle2,
  Info,
  ExternalLink
} from 'lucide-react';
import { Blog } from '../../types/ecommerce';
import { ApiService } from '../../services/api';
import { FormattedBlogContent } from '../../components/blog/FormattedBlogContent';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';

interface AdminBlogsProps {
  blogs: Blog[];
  onRefreshBlogs: () => void;
}

export const AdminBlogs: React.FC<AdminBlogsProps> = ({ blogs, onRefreshBlogs }) => {
  const [blogList, setBlogList] = useState<Blog[]>(blogs || []);
  const [loadingList, setLoadingList] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Partial<Blog> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [imageFit, setImageFit] = useState<'cover' | 'contain'>('cover');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchFreshBlogs = async () => {
    setLoadingList(true);
    try {
      const data = await ApiService.getAdminBlogs();
      if (Array.isArray(data)) {
        setBlogList(data);
      }
    } catch (err) {
      console.warn('Failed to load admin blogs:', err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchFreshBlogs();
  }, []);

  useEffect(() => {
    if (Array.isArray(blogs) && blogs.length > 0) {
      setBlogList(blogs);
    }
  }, [blogs]);

  const handleOpenAdd = () => {
    setEditingBlog({
      title: '',
      slug: '',
      featured_image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
      short_description: '',
      full_content: `## The Heritage of Indian Weaves\n\nIndian textile history spans thousands of years. From the **delicate block prints of Jaipur** to the **rich weaves of Varanasi**, every piece tells a story of craftsmanship.\n\n### Essential Care Guidelines\n- Always wash in **cold water** with mild organic detergent\n- Dry in shade to maintain **vibrant botanical dye luster**\n- Iron on reverse side using low-medium heat\n\n> "True luxury lies in the patience of hand-guided looms and artisan heritage."\n\nDouble line break starts a new paragraph with comfortable spacing and optical contrast.`,
      category: 'Textile Guide',
      author: 'JSArt&Decor Editorial',
      status: 'Published'
    });
    setActiveTab('editor');
    setModalOpen(true);
  };

  const handleOpenEdit = (b: Blog) => {
    setEditingBlog({ ...b });
    setActiveTab('editor');
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this blog post?')) {
      try {
        const updated = blogList.filter(b => b.id !== id);
        const res = await ApiService.saveAdminBlogs(updated);
        setBlogList(Array.isArray(res) ? res : updated);
        onRefreshBlogs();
        setSuccessMsg('Blog deleted successfully from database.');
        setTimeout(() => setSuccessMsg(''), 4000);
      } catch (err: any) {
        alert(err.message || 'Failed to delete blog.');
      }
    }
  };

  // Image Upload from User's Device / Computer
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert('Image file is larger than 8MB. Please select an image under 8MB.');
      return;
    }

    setUploadingImage(true);
    try {
      const uploadedUrl = await ApiService.uploadImage(file, file.name);
      setEditingBlog(prev => prev ? { ...prev, featured_image: uploadedUrl } : null);
    } catch (err: any) {
      alert('Upload failed: ' + (err.message || 'Could not upload image from system'));
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Quick formatting toolbar insertion
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = editingBlog?.full_content || '';
    const selectedText = currentText.substring(start, end) || 'text';
    const newText = currentText.substring(0, start) + prefix + selectedText + suffix + currentText.substring(end);

    setEditingBlog(prev => prev ? { ...prev, full_content: newText } : null);

    setTimeout(() => {
      textarea.focus();
      const cursorStart = start + prefix.length;
      const cursorEnd = cursorStart + selectedText.length;
      textarea.setSelectionRange(cursorStart, cursorEnd);
    }, 50);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = String(editingBlog?.title || '').trim();
    if (!title) {
      alert('Please enter an article title.');
      return;
    }

    setSubmitting(true);
    try {
      // Safe slug generation with null checks
      const slug = (editingBlog?.slug || title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const newId = editingBlog?.id || (blogList.length > 0 ? Math.max(...blogList.map(b => b.id)) + 1 : 1);
      const blogToSave: Blog = {
        id: newId,
        title,
        slug,
        featured_image: editingBlog?.featured_image || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
        short_description: editingBlog?.short_description || '',
        full_content: editingBlog?.full_content || '',
        category: editingBlog?.category || 'General',
        author: editingBlog?.author || 'JSArt&Decor Editorial',
        status: (editingBlog?.status as any) || 'Published',
        created_at: editingBlog?.created_at || new Date().toISOString()
      };

      const idx = blogList.findIndex(b => b.id === blogToSave.id);
      let updated = [...blogList];
      if (idx > -1) {
        updated[idx] = blogToSave;
      } else {
        updated.unshift(blogToSave);
      }

      const savedResult = await ApiService.saveAdminBlogs(updated);
      setBlogList(Array.isArray(savedResult) ? savedResult : updated);
      onRefreshBlogs();
      setModalOpen(false);
      setSuccessMsg('Blog article saved in database and live across all devices!');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to save blog post.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Notification */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm">
          <span>✓ {successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-900">×</button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-neutral-900">
            Blog Management <span className="text-sm font-normal text-neutral-400">({blogList.length})</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Publish textile guides, care instructions, and industry updates with rich formatting, image upload, and multi-device persistence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchFreshBlogs}
            disabled={loadingList}
            className="border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs font-medium px-3 py-2.5 rounded-xl transition shadow-sm"
            title="Reload from Database"
          >
            {loadingList ? 'Syncing...' : 'Sync from DB'}
          </button>

          <button
            onClick={handleOpenAdd}
            className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Blog Article</span>
          </button>
        </div>
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogList.map(b => (
          <div key={b.id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="aspect-[16/9] w-full overflow-hidden bg-neutral-100 border-b border-neutral-200">
                <ImageWithFallback
                  src={b.featured_image}
                  alt={b.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {b.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${b.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-neutral-100 text-neutral-600'}`}>
                      {b.status || 'Published'}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {(b.created_at || '').substring(0, 10)}
                    </span>
                  </div>
                </div>

                <h2 className="text-sm font-bold text-neutral-900 line-clamp-2 leading-snug">
                  {b.title}
                </h2>
                <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                  {b.short_description || 'No summary provided.'}
                </p>
              </div>
            </div>

            <div className="p-4 pt-2 flex items-center justify-between border-t border-neutral-100 text-xs">
              <span className="text-neutral-500 truncate max-w-[150px]">By {b.author}</span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => handleOpenEdit(b)} 
                  className="p-1.5 hover:bg-neutral-100 rounded text-neutral-700 transition"
                  title="Edit Blog"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(b.id)} 
                  className="p-1.5 hover:bg-red-50 rounded text-red-600 transition"
                  title="Delete Blog"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Blog Modal */}
      {modalOpen && editingBlog && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white text-neutral-900 rounded-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl border border-neutral-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="font-bold text-neutral-900 text-base sm:text-lg">
                  {editingBlog.id ? 'Edit Blog Article' : 'Create New Blog Article'}
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Write article content with bold text, line breaks, and upload featured cover images.
                </p>
              </div>

              {/* View Toggle (Editor vs Live Preview) */}
              <div className="flex items-center gap-2">
                <div className="flex bg-neutral-100 p-0.5 rounded-lg border border-neutral-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('editor')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition ${
                      activeTab === 'editor' 
                        ? 'bg-white text-neutral-900 shadow-xs font-semibold' 
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>Editor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition ${
                      activeTab === 'preview' 
                        ? 'bg-white text-neutral-900 shadow-xs font-semibold' 
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Live Preview</span>
                  </button>
                </div>

                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* LIVE PREVIEW TAB */}
            {activeTab === 'preview' ? (
              <div className="space-y-5 bg-[#0A0A0A] p-5 sm:p-6 rounded-xl border border-[#D4A017] text-white">
                <div className="flex items-center justify-between pb-3 border-b border-[#D4A017]/30">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-black bg-[#D4A017] px-2.5 py-0.5 rounded">
                    {editingBlog.category || 'Category'}
                  </span>
                  <span className="text-xs text-[#A3A3A3]">
                    {editingBlog.author || 'Author'} • Preview Mode
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  {editingBlog.title || 'Untitled Blog Article'}
                </h1>

                {/* 16:9 Image Preview */}
                <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-neutral-950 border border-[#D4A017]/40 shadow-md">
                  <ImageWithFallback
                    src={editingBlog.featured_image}
                    alt={editingBlog.title || 'Preview'}
                    className={`w-full h-full ${imageFit === 'cover' ? 'object-cover' : 'object-contain'} object-center`}
                  />
                </div>

                {/* Short Description */}
                {editingBlog.short_description && (
                  <div className="p-3.5 rounded-lg bg-[#141414] border-l-4 border-[#D4A017] text-xs sm:text-sm text-[#F3E5AB]">
                    {editingBlog.short_description}
                  </div>
                )}

                {/* Formatted Content */}
                <div className="pt-2">
                  <FormattedBlogContent content={editingBlog.full_content || ''} />
                </div>
              </div>
            ) : (
              /* EDITOR FORM */
              <form onSubmit={handleSave} className="space-y-4 text-xs text-neutral-900">
                {/* Article Title */}
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">
                    Article Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5 Secrets to Choosing Luxury 400 TC Bedding"
                    value={editingBlog.title ?? ''}
                    onChange={(e) => setEditingBlog(prev => prev ? { ...prev, title: e.target.value } : null)}
                    className="w-full bg-white text-neutral-900 border border-neutral-300 rounded-lg p-2.5 font-medium placeholder:text-neutral-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                {/* Category & Author */}
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

                {/* FEATURED IMAGE UPLOAD & SPECIFICATIONS */}
                <div className="space-y-2.5 p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <label className="font-bold text-neutral-900 flex items-center gap-1.5 text-xs">
                      <ImageIcon className="w-4 h-4 text-amber-600" />
                      <span>Featured Blog Cover Image</span>
                    </label>

                    {/* Image Spec Badge */}
                    <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-200">
                      <span>Aspect Ratio: <strong>16:9</strong></span>
                      <span>•</span>
                      <span>Size: <strong>1200 × 675 px</strong></span>
                    </div>
                  </div>

                  {/* Size & Ratio Guide Box */}
                  <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200 text-[11px] text-neutral-700 space-y-1">
                    <div className="flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Recommended Image Specifications:</strong>
                        <ul className="list-disc pl-4 mt-0.5 space-y-0.5 text-neutral-600">
                          <li><strong>Aspect Ratio:</strong> 16:9 (Landscape widescreen)</li>
                          <li><strong>Recommended Resolution:</strong> 1200 × 675 px (Minimum: 800 × 450 px, Max: 1920 × 1080 px)</li>
                          <li><strong>File Formats:</strong> JPG, PNG, WEBP (Maximum size: 5 MB)</li>
                          <li><strong>Framing:</strong> Keep key subjects centered so they fit cleanly on both mobile and desktop screens.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Image Upload Trigger Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                          <span>Uploading from Device...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4 text-amber-400" />
                          <span>Upload Image from Computer</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2 text-xs text-neutral-600">
                      <span>or fit:</span>
                      <button
                        type="button"
                        onClick={() => setImageFit(imageFit === 'cover' ? 'contain' : 'cover')}
                        className="px-2 py-1 bg-white border border-neutral-300 rounded font-medium text-[11px] hover:bg-neutral-50"
                      >
                        {imageFit === 'cover' ? 'Fit: Cover' : 'Fit: Contain'}
                      </button>
                    </div>
                  </div>

                  {/* Image URL Manual Input */}
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                      Or Direct Image URL (Unsplash / CDN):
                    </label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={editingBlog.featured_image ?? ''}
                      onChange={(e) => setEditingBlog(prev => prev ? { ...prev, featured_image: e.target.value } : null)}
                      className="w-full bg-white text-neutral-900 border border-neutral-300 rounded-lg p-2 font-mono text-[11px] placeholder:text-neutral-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Live Image Fit Preview */}
                  {editingBlog.featured_image && (
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px] text-neutral-500">
                        <span>Image Preview (16:9 Ratio):</span>
                        {editingBlog.featured_image.startsWith('/uploads/') && (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Uploaded from Device
                          </span>
                        )}
                      </div>

                      <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden border border-neutral-300 bg-neutral-950">
                        <ImageWithFallback
                          src={editingBlog.featured_image}
                          alt="Featured Blog Preview"
                          className={`w-full h-full ${imageFit === 'cover' ? 'object-cover' : 'object-contain'} object-center`}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Short Description */}
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">Short Summary (Excerpt)</label>
                  <textarea
                    rows={2}
                    placeholder="Brief synopsis shown on listing cards and top highlight..."
                    value={editingBlog.short_description ?? ''}
                    onChange={(e) => setEditingBlog(prev => prev ? { ...prev, short_description: e.target.value } : null)}
                    className="w-full bg-white text-neutral-900 border border-neutral-300 rounded-lg p-2.5 placeholder:text-neutral-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                {/* Article Full Content with Format Toolbar */}
                <div className="space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <label className="font-bold text-neutral-800">
                      Full Content Body & Formatting
                    </label>
                    <span className="text-[11px] text-neutral-500">
                      Double Enter creates paragraph breaks • Use toolbar for bold & headings
                    </span>
                  </div>

                  {/* Quick Format Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 p-1.5 bg-neutral-100 rounded-lg border border-neutral-200">
                    <button
                      type="button"
                      onClick={() => insertFormatting('**', '**')}
                      className="p-1.5 bg-white hover:bg-amber-50 text-neutral-800 rounded border border-neutral-200 hover:border-amber-400 flex items-center gap-1 text-xs font-bold transition"
                      title="Bold Text (**text**)"
                    >
                      <Bold className="w-3.5 h-3.5 text-neutral-900" />
                      <span>Bold</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => insertFormatting('*', '*')}
                      className="p-1.5 bg-white hover:bg-amber-50 text-neutral-800 rounded border border-neutral-200 hover:border-amber-400 flex items-center gap-1 text-xs italic transition"
                      title="Italic Text (*text*)"
                    >
                      <Italic className="w-3.5 h-3.5 text-neutral-900" />
                      <span>Italic</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => insertFormatting('\n\n## ', '\n')}
                      className="p-1.5 bg-white hover:bg-amber-50 text-neutral-800 rounded border border-neutral-200 hover:border-amber-400 flex items-center gap-1 text-xs font-semibold transition"
                      title="Heading 2 (## Section Title)"
                    >
                      <Heading2 className="w-3.5 h-3.5 text-neutral-900" />
                      <span>Heading</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => insertFormatting('\n\n### ', '\n')}
                      className="p-1.5 bg-white hover:bg-amber-50 text-neutral-800 rounded border border-neutral-200 hover:border-amber-400 flex items-center gap-1 text-xs transition"
                      title="Subheading (### Subheading)"
                    >
                      <Heading3 className="w-3.5 h-3.5 text-neutral-900" />
                      <span>Subhead</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => insertFormatting('\n- ', '\n')}
                      className="p-1.5 bg-white hover:bg-amber-50 text-neutral-800 rounded border border-neutral-200 hover:border-amber-400 flex items-center gap-1 text-xs transition"
                      title="Bullet List (- Item)"
                    >
                      <List className="w-3.5 h-3.5 text-neutral-900" />
                      <span>List</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => insertFormatting('\n> ', '\n')}
                      className="p-1.5 bg-white hover:bg-amber-50 text-neutral-800 rounded border border-neutral-200 hover:border-amber-400 flex items-center gap-1 text-xs transition"
                      title="Quote Block (> Quote text)"
                    >
                      <Quote className="w-3.5 h-3.5 text-neutral-900" />
                      <span>Quote</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => insertFormatting('\n\n', '')}
                      className="p-1.5 bg-white hover:bg-amber-50 text-neutral-800 rounded border border-neutral-200 hover:border-amber-400 flex items-center gap-1 text-xs transition"
                      title="New Paragraph (Double Enter)"
                    >
                      <CornerDownLeft className="w-3.5 h-3.5 text-neutral-900" />
                      <span>Paragraph Break</span>
                    </button>
                  </div>

                  <textarea
                    ref={textareaRef}
                    rows={8}
                    placeholder="Type your blog article here... Use **bold text** for emphasis, ## for section titles, and press Enter twice for a new paragraph."
                    value={editingBlog.full_content ?? ''}
                    onChange={(e) => setEditingBlog(prev => prev ? { ...prev, full_content: e.target.value } : null)}
                    className="w-full bg-white text-neutral-900 border border-neutral-300 rounded-lg p-2.5 placeholder:text-neutral-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none leading-relaxed font-sans text-xs sm:text-sm"
                  />

                  <div className="flex items-center justify-between text-[11px] text-neutral-500 px-1">
                    <span>Formatting syntax: **bold**, *italic*, ## Heading, - List point</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('preview')}
                      className="text-amber-700 hover:text-amber-800 font-semibold underline"
                    >
                      Test in Live Preview →
                    </button>
                  </div>
                </div>

                {/* Modal Action Buttons */}
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
                    disabled={submitting || uploadingImage} 
                    className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-bold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Blog Article</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
