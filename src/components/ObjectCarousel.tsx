import React from 'react';
import { PROP_DEFINITIONS } from '../game/models/PropLibrary';
import { Package, Flower2, Armchair, ShoppingBag, BookOpen, Wine, Lamp, Smile, Droplets, ChevronLeft, ChevronRight } from 'lucide-react';

interface ObjectCarouselProps {
  selectedIndex: number;
  onSelect: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onTransform: () => void;
}

const ICONS: Record<string, React.ReactNode> = {
  Package: <Package className="w-6 h-6" />,
  Flower2: <Flower2 className="w-6 h-6" />,
  Armchair: <Armchair className="w-6 h-6" />,
  ShoppingBag: <ShoppingBag className="w-6 h-6" />,
  BookOpen: <BookOpen className="w-6 h-6" />,
  Wine: <Wine className="w-6 h-6" />,
  Lamp: <Lamp className="w-6 h-6" />,
  Smile: <Smile className="w-6 h-6" />,
  Droplets: <Droplets className="w-6 h-6" />,
};

export const ObjectCarousel: React.FC<ObjectCarouselProps> = ({
  selectedIndex,
  onSelect,
  onPrev,
  onNext,
  onTransform,
}) => {
  const currentProp = PROP_DEFINITIONS[selectedIndex];

  return (
    <div className="flex flex-col items-center select-none pointer-events-auto">
      {/* Title / prompt banner */}
      <div className="bg-black/80 backdrop-blur-md px-4 py-1 rounded-full border border-amber-500/30 text-amber-300 font-extrabold text-xs uppercase tracking-wider mb-2 shadow-lg flex items-center gap-2">
        <span>Transform Into Objects</span>
        <span className="text-white/40">|</span>
        <span className="text-white text-[11px] font-medium">Press [E] to transform</span>
      </div>

      {/* Main Carousel strip */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/75 backdrop-blur-md border border-white/20 shadow-2xl">
        <button
          onClick={onPrev}
          title="Previous (Q)"
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all duration-150"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 overflow-x-auto max-w-[80vw] sm:max-w-md py-1 px-1 scrollbar-none">
          {PROP_DEFINITIONS.map((prop, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={prop.id}
                onClick={() => {
                  onSelect(idx);
                  if (isSelected) onTransform();
                }}
                className={`flex flex-col items-center justify-center min-w-[70px] h-[72px] px-2.5 rounded-xl border transition-all duration-150 ${
                  isSelected
                    ? 'bg-amber-500/30 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="mb-1">{ICONS[prop.iconName] || <Package className="w-6 h-6" />}</div>
                <span className="text-[11px] font-bold truncate max-w-[64px] text-center leading-tight">
                  {prop.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onNext}
          title="Next (E)"
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all duration-150"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Description tag */}
      <div className="mt-1.5 text-xs text-white/80 bg-black/60 px-3 py-0.5 rounded-md font-medium">
        {currentProp?.name} ({currentProp?.category.toUpperCase()}) &bull; Speed: {Math.round(currentProp?.speedMultiplier * 100)}%
      </div>
    </div>
  );
};
