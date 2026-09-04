import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../../types/ecommerce';
import { ProductCard } from './ProductCard';

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: Product[];
  mode: 'Retail' | 'Wholesale';
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number, pricingType: 'Retail' | 'Wholesale') => void;
  autoRotateInterval?: number;
  variant?: 'light' | 'dark';
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  title,
  subtitle,
  products,
  mode,
  onSelectProduct,
  onAddToCart,
  autoRotateInterval = 4000,
  variant = 'dark'
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const isDark = true;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

      if (direction === 'right' && scrollLeft + clientWidth >= scrollWidth - 10) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else if (direction === 'left' && scrollLeft <= 10) {
        scrollRef.current.scrollTo({ left: scrollWidth, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  // Auto rotation timer
  useEffect(() => {
    if (isHovered || !products || products.length <= 1) return;

    const timer = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: 260, behavior: 'smooth' });
        }
      }
    }, autoRotateInterval);

    return () => clearInterval(timer);
  }, [isHovered, products, autoRotateInterval]);

  if (!products || products.length === 0) return null;

  return (
    <section 
      className="py-8 relative bg-transparent"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Centered Section Header matching reference image */}
      <div className="text-center max-w-xl mx-auto mb-6">
        <h2 className="text-xl sm:text-2xl font-serif font-bold uppercase tracking-wider text-white">
          {title}
        </h2>

        {/* Small Gold Ornament Flourish */}
        <div className="flex items-center justify-center gap-2 mt-1.5 mb-1">
          <div className="w-8 h-[1px] bg-[#D4A017]/60" />
          <div className="w-1.5 h-1.5 rotate-45 bg-[#D4A017]" />
          <div className="w-8 h-[1px] bg-[#D4A017]/60" />
        </div>

        {subtitle && (
          <p className="text-xs text-[#A3A3A3]">
            {subtitle}
          </p>
        )}
      </div>

      {/* Carousel Track Container with Side Nav Buttons */}
      <div className="relative group px-2 sm:px-8">
        {/* Left Scroll Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full border border-[#D4A017]/60 bg-[#0A0A0A] text-[#D4A017] hover:border-[#D4A017] hover:bg-[#D4A017] hover:text-black transition-all shadow-lg"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Right Scroll Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full border border-[#D4A017]/60 bg-[#0A0A0A] text-[#D4A017] hover:border-[#D4A017] hover:bg-[#D4A017] hover:text-black transition-all shadow-lg"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Horizontal Track */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-none pb-2 snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <div key={product.id} className="w-[200px] sm:w-[220px] lg:w-[230px] shrink-0 snap-start">
              <ProductCard
                product={product}
                mode={mode}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
