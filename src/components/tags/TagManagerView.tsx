/**
 * RAKAN Prompt - Tag Manager & Analytics View
 */

import React, { useState } from 'react';
import { Tag as TagIcon, Plus, Edit2, Trash2, Merge, Hash } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TagManagerView: React.FC = () => {
  const {
    tags,
    prompts,
    addTag,
    renameTagGlobally,
    deleteTagGlobally,
    mergeTags,
    setFilter,
    setActiveTab,
    t,
  } = useApp();

  const [newTagName, setNewTagName] = useState('');
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Tag merge selection
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [targetTagId, setTargetTagId] = useState<string>('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    await addTag(newTagName.trim());
    setNewTagName('');
  };

  const handleStartRename = (tag: any) => {
    setEditingTagId(tag.id);
    setRenameValue(tag.name);
  };

  const handleSaveRename = async (tagId: string) => {
    if (renameValue.trim()) {
      await renameTagGlobally(tagId, renameValue.trim());
    }
    setEditingTagId(null);
  };

  const handleToggleSelectTag = (id: string) => {
    if (selectedTagIds.includes(id)) {
      setSelectedTagIds((prev) => prev.filter((i) => i !== id));
    } else {
      setSelectedTagIds((prev) => [...prev, id]);
    }
  };

  const handleExecuteMerge = async () => {
    if (!targetTagId || selectedTagIds.length === 0) return;
    await mergeTags(
      targetTagId,
      selectedTagIds.filter((id) => id !== targetTagId)
    );
    setSelectedTagIds([]);
    setTargetTagId('');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-stone-50 dark:bg-stone-900">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-amber-900/10 via-amber-800/10 to-transparent border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-400">
            <TagIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm">{t('tagManager')}</h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              {tags.length} {t('tags')}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        {/* Create Tag Bar */}
        <form onSubmit={handleAdd} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Hash className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="إضافة وسم جديد..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-bold outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={!newTagName.trim()}
            className="px-4 py-2 bg-gradient-to-r from-amber-700 to-amber-600 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
          >
            {t('add')}
          </button>
        </form>

        {/* Merge Tags Tool Panel if 2+ selected */}
        {selectedTagIds.length >= 2 && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
            <div className="flex items-center justify-between font-bold text-amber-800 dark:text-amber-300">
              <span>أداة دمج الوسوم المختارة ({selectedTagIds.length})</span>
              <button
                onClick={() => setSelectedTagIds([])}
                className="text-[10px] text-stone-500 underline"
              >
                {t('cancel')}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={targetTagId}
                onChange={(e) => setTargetTagId(e.target.value)}
                className="flex-1 p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-bold"
              >
                <option value="">اختر الوسم المستهدف للدمج إليه...</option>
                {tags
                  .filter((t) => selectedTagIds.includes(t.id))
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      #{t.name}
                    </option>
                  ))}
              </select>

              <button
                onClick={handleExecuteMerge}
                disabled={!targetTagId}
                className="px-3 py-2 bg-amber-600 text-white font-bold rounded-xl disabled:opacity-50 flex items-center gap-1"
              >
                <Merge className="w-3.5 h-3.5" />
                <span>{t('mergeTags')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tags List */}
        <div className="space-y-2">
          {tags.length === 0 ? (
            <div className="py-12 text-center text-stone-400">لا توجد وسوم مضافة حتى الآن.</div>
          ) : (
            tags.map((tag) => {
              const count = prompts.filter((p) => p.tags.includes(tag.name) && !p.isDeleted).length;
              const isSelectedForMerge = selectedTagIds.includes(tag.id);

              return (
                <div
                  key={tag.id}
                  className={`p-3 rounded-2xl bg-stone-100 dark:bg-stone-850 border transition-all flex items-center justify-between ${
                    isSelectedForMerge
                      ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5'
                      : 'border-stone-200 dark:border-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelectedForMerge}
                      onChange={() => handleToggleSelectTag(tag.id)}
                      className="w-4 h-4 rounded text-amber-600 accent-amber-600"
                    />

                    {editingTagId === tag.id ? (
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => handleSaveRename(tag.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(tag.id)}
                        autoFocus
                        className="px-2 py-1 rounded bg-white dark:bg-stone-800 border font-bold text-xs"
                      />
                    ) : (
                      <button
                        onClick={() => {
                          setFilter((prev) => ({ ...prev, selectedTag: tag.name }));
                          setActiveTab('search');
                        }}
                        className="font-bold text-xs text-amber-700 dark:text-amber-400 hover:underline truncate"
                      >
                        #{tag.name}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-bold text-[10px] rounded-md">
                      {count} {t('prompts')}
                    </span>

                    <button
                      onClick={() => handleStartRename(tag)}
                      className="p-1 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(t('deleteTagGlobally'))) {
                          deleteTagGlobally(tag.id);
                        }
                      }}
                      className="p-1 rounded text-stone-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
