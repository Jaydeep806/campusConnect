'use client';

import { CATEGORIES } from '../constants/categories';
import {
  Sparkles,
  Terminal,
  Palette,
  Trophy,
  HeartHandshake,
  Camera,
  Lightbulb,
  BookOpen,
} from 'lucide-react';

interface CategoryFiltersProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  All: Sparkles,
  Technical: Terminal,
  Cultural: Palette,
  Sports: Trophy,
  Social: HeartHandshake,
  Creative: Camera,
  Entrepreneurship: Lightbulb,
  Literary: BookOpen,
};

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="category-filter-row">
      {CATEGORIES.map((cat) => {
        const Icon = CATEGORY_ICONS[cat] || Sparkles;
        const isActive = selectedCategory === cat;
        return (
          <button
            key={cat}
            className={`category-pill ${isActive ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat)}
          >
            <span>{cat}</span>
          </button>
        );
      })}
    </div>
  );
};
