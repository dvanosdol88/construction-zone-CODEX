import React, { useState, useRef, useEffect } from 'react';
import { X, Search, Check, FileText, FileImage, File } from 'lucide-react';
import { useDocumentStore, DocumentMeta } from '../documentStore';

interface DocumentPickerModalProps {
  linkedDocIds: string[];
  onLink: (docId: string) => void;
  onUnlink: (docId: string) => void;
  onClose: () => void;
}

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const TEXT_EXTENSIONS = ['txt', 'md', 'html'];

function getFileIcon(fileType: string) {
  if (IMAGE_EXTENSIONS.includes(fileType)) {
    return <FileImage size={20} className="text-blue-500" />;
  }
  if (TEXT_EXTENSIONS.includes(fileType)) {
    return <FileText size={20} className="text-green-500" />;
  }
  return <File size={20} className="text-slate-400" />;
}

export default function DocumentPickerModal({
  linkedDocIds,
  onLink,
  onUnlink,
  onClose,
}: DocumentPickerModalProps) {
  const { documents, loadDocuments } = useDocumentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const filteredDocs = documents
    .filter((doc) =>
      searchQuery
        ? doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    )
    .sort((a, b) => b.uploadedAt - a.uploadedAt);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleToggle = (doc: DocumentMeta) => {
    if (linkedDocIds.includes(doc.id)) {
      onUnlink(doc.id);
    } else {
      onLink(doc.id);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">
            Link Documents
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredDocs.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              {searchQuery
                ? `No documents match "${searchQuery}"`
                : 'No documents available'}
            </div>
          )}

          <div className="grid grid-cols-1 gap-2">
            {filteredDocs.map((doc) => {
              const isLinked = linkedDocIds.includes(doc.id);
              return (
                <button
                  key={doc.id}
                  onClick={() => handleToggle(doc)}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                    isLinked
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {/* Thumbnail/Icon */}
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {IMAGE_EXTENSIONS.includes(doc.fileType) ? (
                      <img
                        src={doc.storageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getFileIcon(doc.fileType)
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {doc.filename}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Check */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isLinked
                        ? 'bg-blue-500 text-white'
                        : 'border-2 border-slate-300'
                    }`}
                  >
                    {isLinked && <Check size={14} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
          <span className="text-sm text-slate-500">
            {linkedDocIds.length} document{linkedDocIds.length !== 1 ? 's' : ''}{' '}
            linked
          </span>
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
