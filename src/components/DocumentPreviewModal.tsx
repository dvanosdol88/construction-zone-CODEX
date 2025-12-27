import React, { useState, useEffect, useRef } from 'react';
import { X, Download, ExternalLink } from 'lucide-react';
import { getBlob, ref } from 'firebase/storage';
import { storage } from '../firebaseConfig';
import type { DocumentMeta } from '../documentStore';

interface DocumentPreviewModalProps {
  doc: DocumentMeta;
  onClose: () => void;
}

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const TEXT_EXTENSIONS = ['txt', 'md', 'html'];

export default function DocumentPreviewModal({
  doc,
  onClose,
}: DocumentPreviewModalProps) {
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const isImage = IMAGE_EXTENSIONS.includes(doc.fileType);
  const isText = TEXT_EXTENSIONS.includes(doc.fileType);
  const isPdf = doc.fileType === 'pdf';
  const contextParts = [doc.page, doc.section, doc.tab].filter(Boolean);
  const tags = doc.tags ?? [];

  useEffect(() => {
    let isActive = true;
    if (isText) {
      setLoading(true);
      setLoadError(null);
      const storagePath = `documents/${doc.id}-${doc.filename}`;
      const storageRef = ref(storage, storagePath);
      getBlob(storageRef)
        .then((blob) => blob.text())
        .then((text) => {
          if (!isActive) return;
          setTextContent(text);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load text content:', err);
          if (!isActive) return;
          setLoadError('Preview unavailable. Use Open or Download.');
          setLoading(false);
        });
    }
    return () => {
      isActive = false;
    };
  }, [doc, isText]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-800 truncate">
              {doc.filename}
            </h2>
            {doc.summary && (
              <p className="text-xs text-blue-600 font-medium italic mt-0.5 line-clamp-1">
                {doc.summary}
              </p>
            )}
            {(contextParts.length > 0 || tags.length > 0) && (
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                {contextParts.length > 0 && (
                  <span>{contextParts.join(' • ')}</span>
                )}
                {tags.length > 0 && (
                  <span className="flex flex-wrap gap-1">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <a
              href={doc.storageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              title="Open in new tab"
            >
              <ExternalLink size={20} />
            </a>
            <a
              href={doc.storageUrl}
              download={doc.filename}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              title="Download"
            >
              <Download size={20} />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-slate-50 flex items-center justify-center">
          {isImage && (
            <img
              src={doc.storageUrl}
              alt={doc.filename}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
          )}

          {isText && (
            <div className="w-full h-full bg-white rounded-lg border border-slate-200 p-6 overflow-auto">
              {loading && (
                <div className="text-center text-slate-400">Loading...</div>
              )}
              {!loading && loadError && (
                <div className="text-center text-slate-500">{loadError}</div>
              )}
              {!loading && !loadError && doc.fileType === 'html' && (
                <div dangerouslySetInnerHTML={{ __html: textContent || '' }} />
              )}
              {!loading && !loadError && doc.fileType !== 'html' && (
                <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono">
                  {textContent}
                </pre>
              )}
            </div>
          )}

          {isPdf && (
            <iframe
              src={`${doc.storageUrl}#toolbar=0`}
              className="w-full h-full rounded-lg shadow-lg bg-white"
              title={doc.filename}
            />
          )}

          {!isImage && !isText && !isPdf && (
            <div className="text-center">
              <p className="text-slate-500 mb-4">
                Preview not available for this file type.
              </p>
              <a
                href={doc.storageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Download size={20} />
                Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
