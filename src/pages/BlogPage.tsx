import React, { useState } from 'react';
import { ArrowLeft, User, Calendar, Tag, BookOpen, X, Sparkles } from 'lucide-react';
import { Blog } from '../types/ecommerce';
import { FormattedBlogContent } from '../components/blog/FormattedBlogContent';
import { ImageWithFallback } from '../components/common/ImageWithFallback';

interface BlogPageProps {
  blogs: Blog[];
  initialBlogId?: number;
  onNavigate: (view: string, param?: any) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ blogs, initialBlogId, onNavigate }) => {
  const [activeBlog, setActiveBlog] = useState<Blog | null>(
    initialBlogId ? blogs.find(b => b.id === initialBlogId) || null : null
  );

  return (
    <div id="blog-page-view" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 min-h-screen text-white">
      {/* Header */}
      <div className="border-b border-[#D4A017]/30 pb-4">
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white">
          Textile Knowledge & Decor Insights
        </h1>
        <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1">
          Guides on thread count selection, Jaipur block-print preservation, and B2B hospitality decor trends.
        </p>
      </div>

      {/* Active Blog Full Reader View */}
      {activeBlog ? (
        <div className="bg-[#0A0A0A] p-6 sm:p-10 rounded-2xl border border-[#D4A017] shadow-[0_0_20px_rgba(212,160,23,0.2)] space-y-8 max-w-4xl mx-auto">
          <button
            onClick={() => setActiveBlog(null)}
            className="text-xs font-semibold text-[#D4A017] hover:text-[#E5B842] flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Articles</span>
          </button>

          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-black bg-[#D4A017] px-2.5 py-1 rounded border border-[#D4A017]">
              {activeBlog.category}
            </span>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
              {activeBlog.title}
            </h2>

            <div className="flex items-center gap-4 text-xs text-[#A3A3A3] border-y border-[#D4A017]/30 py-2">
              <span className="flex items-center gap-1 text-[#E5B842]">
                <User className="w-3.5 h-3.5" />
                {activeBlog.author}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {(activeBlog.created_at || '').substring(0, 10) || 'Recent'}
              </span>
            </div>
          </div>

          {/* Featured Image with 16:9 Aspect Ratio and proper fit */}
          <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-[#141414] border-2 border-[#D4A017] shadow-[0_0_15px_rgba(212,160,23,0.2)]">
            <ImageWithFallback 
              src={activeBlog.featured_image} 
              alt={activeBlog.title} 
              className="w-full h-full object-cover object-center" 
            />
          </div>

          {/* Short description / Lead highlight */}
          {activeBlog.short_description && (
            <div className="p-4 rounded-xl bg-[#141414] border-l-4 border-[#D4A017] text-sm text-[#F3E5AB] font-medium leading-relaxed">
              {activeBlog.short_description}
            </div>
          )}

          {/* Formatted Full Content with Bold Text, Paragraphs, Line Breaks, and Headings */}
          <div className="pt-2">
            <FormattedBlogContent content={activeBlog.full_content} />
          </div>
        </div>
      ) : (
        /* Blog List Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              onClick={() => setActiveBlog(blog)}
              className="group bg-[#0A0A0A] rounded-xl border border-[#D4A017] overflow-hidden cursor-pointer hover:shadow-[0_0_20px_rgba(212,160,23,0.35)] transition shadow-[0_0_10px_rgba(212,160,23,0.1)] flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[16/9] w-full overflow-hidden bg-[#141414] border-b border-[#D4A017]">
                  <ImageWithFallback 
                    src={blog.featured_image} 
                    alt={blog.title} 
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>

                <div className="p-5 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-black bg-[#D4A017] px-2 py-0.5 rounded border border-[#D4A017]">
                    {blog.category}
                  </span>

                  <h3 className="text-sm font-bold text-white group-hover:text-[#E5B842] transition line-clamp-2">
                    {blog.title}
                  </h3>

                  <p className="text-xs text-[#A3A3A3] line-clamp-3 leading-relaxed">
                    {blog.short_description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 text-xs font-semibold text-[#D4A017] flex items-center gap-1 group-hover:text-[#E5B842]">
                <span>Read Full Guide</span>
                <BookOpen className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
