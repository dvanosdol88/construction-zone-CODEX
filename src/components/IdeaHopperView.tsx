import React, { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Loader2,
  AlertCircle,
  Lightbulb,
  X,
  ExternalLink,
  Tag,
} from 'lucide-react';
import { useIdeaHopperStore, HopperIdea } from '../ideaHopperStore';
import IdeaHopperCard from './IdeaHopperCard';

export default function IdeaHopperView() {
  const {
    isLoading,
    error,
    searchQuery,
    selectedIdeaId,
    setSearchQuery,
    setSelectedIdeaId,
    loadIdeas,
    addIdea,
    updateIdea,
    deleteIdea,
    getFilteredIdeas,
    getSelectedIdea,
  } = useIdeaHopperStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newIdea, setNewIdea] = useState({
    title: '',
    description: '',
    referenceUrl: '',
    tags: '',
    priority: 'medium' as HopperIdea['priority'],
  });

  useEffect(() => {
    loadIdeas();
  }, [loadIdeas]);

  const filteredIdeas = getFilteredIdeas();
  const selectedIdea = getSelectedIdea();

  const handleAddIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdea.title.trim()) return;

    await addIdea({
      title: newIdea.title.trim(),
      description: newIdea.description.trim(),
      referenceUrl: newIdea.referenceUrl.trim() || undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'new',
      priority: newIdea.priority,
      tags: newIdea.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      notes: '',
    });

    setNewIdea({
      title: '',
      description: '',
      referenceUrl: '',
      tags: '',
      priority: 'medium',
    });
    setShowAddModal(false);
  };

  const handleStatusChange = (id: string, status: HopperIdea['status']) => {
    updateIdea(id, { status });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading ideas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <p className="text-red-700 font-medium mb-2">Connection Error</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={() => loadIdeas()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-50">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto py-6 px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Lightbulb className="w-8 h-8 text-amber-500" />
                Idea Hopper
              </h1>
              <p className="text-slate-500 mt-1">
                Capture and develop ideas for your RIA practice
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
            >
              <Plus size={18} />
              New Idea
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search ideas by title, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Empty State */}
          {filteredIdeas.length === 0 && !searchQuery && (
            <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-200">
              <Lightbulb className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-4">No ideas in the hopper yet</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Add your first idea
              </button>
            </div>
          )}

          {/* No Results */}
          {filteredIdeas.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">
                No ideas found matching "{searchQuery}"
              </p>
            </div>
          )}

          {/* Ideas Grid */}
          {filteredIdeas.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIdeas.map((idea) => (
                <IdeaHopperCard
                  key={idea.id}
                  idea={idea}
                  onSelect={setSelectedIdeaId}
                  onDelete={deleteIdea}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedIdea && (
        <div className="w-96 bg-white border-l border-slate-200 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">
                {selectedIdea.title}
              </h2>
              <button
                onClick={() => setSelectedIdeaId(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-slate-600 mb-6">{selectedIdea.description}</p>

            {selectedIdea.referenceUrl && (
              <a
                href={selectedIdea.referenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 hover:underline"
              >
                <ExternalLink size={16} />
                View Reference
              </a>
            )}

            {selectedIdea.tags.length > 0 && (
              <div className="mb-6">
                <label className="text-xs font-medium text-slate-500 uppercase mb-2 block">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedIdea.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-sm text-slate-600 bg-slate-100 px-2.5 py-1 rounded"
                    >
                      <Tag size={12} />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase mb-2 block">
                  Status
                </label>
                <select
                  value={selectedIdea.status}
                  onChange={(e) =>
                    updateIdea(selectedIdea.id, {
                      status: e.target.value as HopperIdea['status'],
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="new">New</option>
                  <option value="exploring">Exploring</option>
                  <option value="developing">Developing</option>
                  <option value="implemented">Implemented</option>
                  <option value="parked">Parked</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 uppercase mb-2 block">
                  Priority
                </label>
                <select
                  value={selectedIdea.priority}
                  onChange={(e) =>
                    updateIdea(selectedIdea.id, {
                      priority: e.target.value as HopperIdea['priority'],
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 uppercase mb-2 block">
                  Notes
                </label>
                <textarea
                  value={selectedIdea.notes}
                  onChange={(e) =>
                    updateIdea(selectedIdea.id, { notes: e.target.value })
                  }
                  placeholder="Add notes about this idea..."
                  rows={6}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Idea Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-slate-900">
                Add New Idea
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddIdea} className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Title *
                </label>
                <input
                  type="text"
                  value={newIdea.title}
                  onChange={(e) =>
                    setNewIdea({ ...newIdea, title: e.target.value })
                  }
                  placeholder="What's the idea?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Description
                </label>
                <textarea
                  value={newIdea.description}
                  onChange={(e) =>
                    setNewIdea({ ...newIdea, description: e.target.value })
                  }
                  placeholder="Describe the idea in more detail..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Reference URL
                </label>
                <input
                  type="url"
                  value={newIdea.referenceUrl}
                  onChange={(e) =>
                    setNewIdea({ ...newIdea, referenceUrl: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={newIdea.tags}
                  onChange={(e) =>
                    setNewIdea({ ...newIdea, tags: e.target.value })
                  }
                  placeholder="marketing, automation, client-experience"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Priority
                </label>
                <select
                  value={newIdea.priority}
                  onChange={(e) =>
                    setNewIdea({
                      ...newIdea,
                      priority: e.target.value as HopperIdea['priority'],
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newIdea.title.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
                >
                  Add Idea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
