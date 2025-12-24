import React from 'react';
import {
  ExternalLink,
  Trash2,
  Tag,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import type { HopperIdea } from '../ideaHopperStore';

interface IdeaHopperCardProps {
  idea: HopperIdea;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: HopperIdea['status']) => void;
}

const STATUS_CONFIG: Record<
  HopperIdea['status'],
  { label: string; color: string; bgColor: string }
> = {
  new: { label: 'New', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  exploring: { label: 'Exploring', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  developing: { label: 'Developing', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  implemented: { label: 'Implemented', color: 'text-green-700', bgColor: 'bg-green-100' },
  parked: { label: 'Parked', color: 'text-slate-500', bgColor: 'bg-slate-200' },
};

const PRIORITY_ICONS: Record<HopperIdea['priority'], React.ReactNode> = {
  high: <ArrowUp size={12} className="text-red-500" />,
  medium: <Minus size={12} className="text-amber-500" />,
  low: <ArrowDown size={12} className="text-slate-400" />,
};

export default function IdeaHopperCard({
  idea,
  onSelect,
  onDelete,
  onStatusChange,
}: IdeaHopperCardProps) {
  const statusConfig = STATUS_CONFIG[idea.status];
  const formattedDate = new Date(idea.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete "${idea.title}"? This cannot be undone.`)) {
      onDelete(idea.id);
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    onStatusChange(idea.id, e.target.value as HopperIdea['status']);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      onClick={() => onSelect(idea.id)}
      className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md hover:border-slate-300 p-4 transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}
            >
              {statusConfig.label}
            </span>
            <span className="flex items-center gap-1" title={`Priority: ${idea.priority}`}>
              {PRIORITY_ICONS[idea.priority]}
            </span>
          </div>
          <h3 className="text-slate-900 font-semibold text-base leading-tight truncate">
            {idea.title}
          </h3>
        </div>

        <button
          onClick={handleDelete}
          className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
          title="Delete idea"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Description */}
      <p className="text-slate-600 text-sm leading-relaxed mb-3 line-clamp-2">
        {idea.description}
      </p>

      {/* Reference URL */}
      {idea.referenceUrl && (
        <a
          href={idea.referenceUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleLinkClick}
          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm mb-3 hover:underline"
        >
          <ExternalLink size={14} />
          <span className="truncate">{idea.referenceUrl}</span>
        </a>
      )}

      {/* Tags */}
      {idea.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {idea.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded"
            >
              <Tag size={10} />
              {tag}
            </span>
          ))}
          {idea.tags.length > 3 && (
            <span className="text-xs text-slate-400">+{idea.tags.length - 3} more</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock size={12} />
          {formattedDate}
        </div>

        <select
          value={idea.status}
          onChange={handleStatusChange}
          onClick={(e) => e.stopPropagation()}
          className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-600 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <option value="new">New</option>
          <option value="exploring">Exploring</option>
          <option value="developing">Developing</option>
          <option value="implemented">Implemented</option>
          <option value="parked">Parked</option>
        </select>
      </div>
    </div>
  );
}
