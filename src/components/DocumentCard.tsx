import React from 'react';
import { Star, Trash2, Link2, FileText, FileImage, File, Download } from 'lucide-react';
import type { DocumentMeta } from '../documentStore';

interface DocumentCardProps {
  doc: DocumentMeta;
  onToggleCanonical: (id: string) => void;
  onDelete: (doc: DocumentMeta) => void;
  onPreview: (doc: DocumentMeta) => void;
  compact?: boolean;
}

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const TEXT_EXTENSIONS = ['txt', 'md', 'html'];

function getFileIcon(fileType: string) {
  if (IMAGE_EXTENSIONS.includes(fileType)) {
    return <FileImage size={24} className="text-blue-500" />;
  }
  if (TEXT_EXTENSIONS.includes(fileType)) {
    return <FileText size={24} className="text-green-500" />;
  }
  return <File size={24} className="text-slate-400" />;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(timestamp: number | undefined): string {
  if (!timestamp) return 'Unknown date';
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DocumentCard({
  doc,
  onToggleCanonical,
  onDelete,
  onPreview,
  compact = false,
}: DocumentCardProps) {
  const isImage = IMAGE_EXTENSIONS.includes(doc.fileType);
  const isPreviewable = IMAGE_EXTENSIONS.includes(doc.fileType) || TEXT_EXTENSIONS.includes(doc.fileType);

  return (
    <div
      className={`bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all group cursor-pointer ${
        compact ? 'w-48 flex-shrink-0' : ''
      }`}
      onClick={() => onPreview(doc)}
    >
      {/* Thumbnail / Icon */}
      <div className={`${compact ? 'h-28' : 'h-36'} bg-slate-50 rounded-t-lg flex items-center justify-center overflow-hidden relative`}>
        {isImage ? (
          <img
            src={doc.storageUrl}
            alt={doc.filename}
            className="w-full h-full object-cover"
          />
        ) : (
          getFileIcon(doc.fileType)
        )}

        {/* Star button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleCanonical(doc.id);
          }}
          className={`absolute top-2 left-2 p-1.5 rounded-full transition-all ${
            doc.isCanonical
              ? 'bg-amber-100 text-amber-500'
              : 'bg-white/80 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-amber-500'
          }`}
          title={doc.isCanonical ? 'Remove from Canonical' : 'Mark as Canonical'}
        >
          <Star size={16} className={doc.isCanonical ? 'fill-amber-500' : ''} />
        </button>

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(doc);
          }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 transition-all"
          title="Delete document"
        >
          <Trash2 size={16} />
        </button>

        {/* Download button for non-previewable */}
        {!isPreviewable && (
          <a
            href={doc.storageUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-2 right-2 p-1.5 rounded-full bg-blue-500 text-white opacity-0 group-hover:opacity-100 hover:bg-blue-600 transition-all"
            title="Download"
          >
            <Download size={16} />
          </a>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium text-slate-800 truncate" title={doc.filename || 'Untitled'}>
          {doc.filename || 'Untitled'}
        </p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-slate-400">{formatDate(doc.uploadedAt)}</span>
          <span className="text-xs text-slate-400">{formatFileSize(doc.size || 0)}</span>
        </div>
        {(doc.linkedCards?.length ?? 0) > 0 && (
          <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
            <Link2 size={12} />
            <span>{doc.linkedCards.length} card{doc.linkedCards.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
}

