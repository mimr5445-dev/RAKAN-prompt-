/**
 * RAKAN Prompt - Rich Mobile Prompt Editor Modal
 * Features: Undo/Redo, line numbers, monospace toggle, character counter, word counter,
 * search & replace in prompt text, AI Prompt Enhancer, image upload/dropzone.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Image as ImageIcon,
  Trash2,
  Copy,
  Undo,
  Redo,
  Search,
  Replace,
  Star,
  Pin,
  Heart,
  Tag as TagIcon,
  Check,
  Code,
  Hash,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ImageService } from '../../services/imageService';
import { LABEL_COLORS, CATEGORY_EMOJIS } from '../../theme/colors';

export const PromptEditorModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    editingPrompt,
    sections,
    categories,
    activeSectionId,
    activeCategoryId,
    createPrompt,
    updatePrompt,
    addTag,
    tags: globalTags,
    t,
  } = useApp();

  const isEditing = activeModal === 'edit_prompt' && editingPrompt !== null;
  const isOpen = activeModal === 'create_prompt' || activeModal === 'edit_prompt';

  // Form State
  const [sectionId, setSectionId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [notes, setNotes] = useState('');
  const [promptTags, setPromptTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [rating, setRating] = useState(5);
  const [colorLabel, setColorLabel] = useState<string | undefined>(undefined);
  const [emoji, setEmoji] = useState('✨');
  const [isPinned, setIsPinned] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Editor Options
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [monospaceFont, setMonospaceFont] = useState(true);

  // Undo / Redo History stack
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Search & Replace inside prompt
  const [showReplaceTool, setShowReplaceTool] = useState(false);
  const [findWord, setFindWord] = useState('');
  const [replaceWith, setReplaceWith] = useState('');

  useEffect(() => {
    if (isEditing && editingPrompt) {
      setSectionId(editingPrompt.sectionId);
      setCategoryId(editingPrompt.categoryId);
      setTitle(editingPrompt.title);
      setPrompt(editingPrompt.prompt);
      setNegativePrompt(editingPrompt.negativePrompt || '');
      setNotes(editingPrompt.notes || '');
      setPromptTags(editingPrompt.tags || []);
      setImages(editingPrompt.images || []);
      setRating(editingPrompt.rating || 5);
      setColorLabel(editingPrompt.colorLabel);
      setEmoji(editingPrompt.emoji || '✨');
      setIsPinned(editingPrompt.isPinned || false);
      setIsFavorite(editingPrompt.isFavorite || false);
      setHistory([editingPrompt.prompt]);
      setHistoryIndex(0);
    } else {
      const defaultSec = activeSectionId || (sections[0]?.id || '');
      const secCats = categories.filter((c) => c.sectionId === defaultSec);
      const defaultCat = activeCategoryId || (secCats[0]?.id || '');

      setSectionId(defaultSec);
      setCategoryId(defaultCat);
      setTitle('');
      setPrompt('');
      setNegativePrompt('');
      setNotes('');
      setPromptTags([]);
      setImages([]);
      setRating(5);
      setColorLabel(undefined);
      setEmoji('✨');
      setIsPinned(false);
      setIsFavorite(false);
      setHistory(['']);
      setHistoryIndex(0);
    }
  }, [isEditing, editingPrompt, activeModal, activeSectionId, activeCategoryId, sections, categories]);

  // Handle Section Change -> auto set category
  const handleSectionChange = (newSecId: string) => {
    setSectionId(newSecId);
    const secCats = categories.filter((c) => c.sectionId === newSecId);
    if (secCats.length > 0) {
      setCategoryId(secCats[0].id);
    } else {
      setCategoryId('');
    }
  };

  // Push to undo history when prompt changes
  const handlePromptChange = (val: string) => {
    setPrompt(val);
    if (history[historyIndex] !== val) {
      const updatedHistory = history.slice(0, historyIndex + 1);
      updatedHistory.push(val);
      setHistory(updatedHistory);
      setHistoryIndex(updatedHistory.length - 1);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setPrompt(history[newIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setPrompt(history[newIdx]);
    }
  };

  // Search & Replace Execution
  const handleReplaceAll = () => {
    if (!findWord) return;
    const regex = new RegExp(findWord, 'gi');
    const updated = prompt.replace(regex, replaceWith);
    handlePromptChange(updated);
  };

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const rawBase64 = await ImageService.fileToBase64(files[i]);
      const compressed = await ImageService.compressImage(rawBase64);
      setImages((prev) => [...prev, compressed]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Tag Management inside Editor
  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && !promptTags.includes(clean)) {
      setPromptTags((prev) => [...prev, clean]);
      addTag(clean);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagName: string) => {
    setPromptTags((prev) => prev.filter((t) => t !== tagName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !prompt.trim() || !categoryId) return;

    if (isEditing && editingPrompt) {
      await updatePrompt({
        ...editingPrompt,
        sectionId,
        categoryId,
        title: title.trim(),
        prompt: prompt.trim(),
        negativePrompt: negativePrompt.trim(),
        notes: notes.trim(),
        tags: promptTags,
        images,
        rating,
        colorLabel,
        emoji,
        isPinned,
        isFavorite,
      });
    } else {
      await createPrompt({
        sectionId,
        categoryId,
        title: title.trim(),
        prompt: prompt.trim(),
        negativePrompt: negativePrompt.trim(),
        notes: notes.trim(),
        tags: promptTags,
        images,
        rating,
        colorLabel,
        emoji,
        isPinned,
        isFavorite,
      });
    }

    setActiveModal(null);
  };

  if (!isOpen) return null;

  const charCount = prompt.length;
  const wordCount = prompt.trim() ? prompt.trim().split(/\s+/).length : 0;
  const lineCount = prompt ? prompt.split('\n').length : 1;

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="w-full max-w-md bg-stone-100 dark:bg-stone-900 rounded-t-3xl sm:rounded-3xl p-4 shadow-2xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 max-h-[94vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 shrink-0">
            <h3 className="font-extrabold text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{isEditing ? t('editPrompt') : t('createPrompt')}</span>
            </h3>

            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Scroll Area */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-1 space-y-4 text-xs">
            {/* Section & Category Selectors */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div>
                <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">
                  {t('selectSection')}
                </label>
                <select
                  value={sectionId}
                  onChange={(e) => handleSectionChange(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-bold"
                >
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">
                  {t('categoryName')}
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-bold"
                >
                  {categories
                    .filter((c) => c.sectionId === sectionId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Title & Emoji Input */}
            <div>
              <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">
                {t('promptTitle')}
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  className="w-12 px-1 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-lg text-center"
                >
                  {CATEGORY_EMOJIS.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="عنوان توضيحي للأمر..."
                  required
                  className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-bold outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Main Prompt Text Area with Rich Controls */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-extrabold text-stone-700 dark:text-stone-300">
                  {t('promptContent')} *
                </label>

                {/* Editor Toolbar (Undo, Redo, Monospace, Search & Replace, AI) */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                    className="p-1 rounded bg-stone-200/80 dark:bg-stone-800 hover:bg-stone-300 disabled:opacity-30"
                    title={t('undo')}
                  >
                    <Undo className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                    className="p-1 rounded bg-stone-200/80 dark:bg-stone-800 hover:bg-stone-300 disabled:opacity-30"
                    title={t('redo')}
                  >
                    <Redo className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMonospaceFont(!monospaceFont)}
                    className={`p-1 rounded text-[10px] font-mono font-bold ${
                      monospaceFont ? 'bg-amber-600 text-white' : 'bg-stone-200 dark:bg-stone-800'
                    }`}
                  >
                    Mono
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReplaceTool(!showReplaceTool)}
                    className={`p-1 rounded ${
                      showReplaceTool ? 'bg-amber-600 text-white' : 'bg-stone-200 dark:bg-stone-800'
                    }`}
                  >
                    <Replace className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Replace Tool Panel */}
              {showReplaceTool && (
                <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder={t('findWord')}
                      value={findWord}
                      onChange={(e) => setFindWord(e.target.value)}
                      className="px-2 py-1 rounded bg-white dark:bg-stone-800 border text-xs"
                    />
                    <input
                      type="text"
                      placeholder={t('replaceWith')}
                      value={replaceWith}
                      onChange={(e) => setReplaceWith(e.target.value)}
                      className="px-2 py-1 rounded bg-white dark:bg-stone-800 border text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleReplaceAll}
                    className="w-full py-1 bg-amber-600 text-white font-bold rounded text-xs"
                  >
                    {t('replaceAll')}
                  </button>
                </div>
              )}

              {/* Prompt Textarea */}
              <div className="relative rounded-2xl overflow-hidden border border-stone-300 dark:border-stone-700 bg-stone-900 text-amber-200 dark:bg-stone-950">
                <textarea
                  value={prompt}
                  onChange={(e) => handlePromptChange(e.target.value)}
                  placeholder="اكتب العبارة أو الأمر هنا بالتفصيل (Prompt)..."
                  rows={5}
                  required
                  className={`w-full p-3 bg-transparent outline-none resize-none leading-relaxed text-xs ${
                    monospaceFont ? 'font-mono' : ''
                  }`}
                />

                {/* Character & Word counter footer */}
                <div className="px-3 py-1 bg-black/40 text-[10px] text-stone-400 flex items-center justify-between font-mono border-t border-stone-800">
                  <span>
                    {lineCount} أسطر • {wordCount} {t('wordCount')}
                  </span>
                  <span className="font-bold text-amber-400">
                    {charCount} {t('characterCount')}
                  </span>
                </div>
              </div>
            </div>

            {/* Negative Prompt */}
            <div>
              <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">
                {t('negativePrompt')}
              </label>
              <textarea
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="الأشياء المراد تجنبها (blurry, low quality, extra limbs...)"
                rows={2}
                className="w-full p-2.5 rounded-xl bg-stone-900/90 text-rose-300 dark:bg-stone-950 dark:text-rose-200 font-mono text-xs border border-stone-800 outline-none"
              />
            </div>

            {/* Image Upload & Gallery Dropzone */}
            <div>
              <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">
                {t('images')}
              </label>

              <div className="space-y-2">
                <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-2xl cursor-pointer hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors">
                  <ImageIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-1" />
                  <span className="text-[11px] font-bold text-stone-600 dark:text-stone-400">
                    {t('dropImagesHere')}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 group border">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Rating Stars & Color Label */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">
                  {t('rating')}
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= rating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-stone-300 dark:text-stone-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">
                  {t('colorLabel')}
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto p-0.5">
                  {LABEL_COLORS.slice(0, 6).map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setColorLabel(colorLabel === c ? undefined : c)}
                      className={`w-6 h-6 rounded-full shrink-0 border-2 ${
                        colorLabel === c ? 'border-amber-500 scale-110 shadow-sm' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Tags Input */}
            <div>
              <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">
                {t('tags')}
              </label>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="اكتب وسماً ثم اضغط إضافة..."
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-2 bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold rounded-xl"
                  >
                    {t('add')}
                  </button>
                </div>

                {promptTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {promptTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold rounded-lg border border-amber-500/20 flex items-center gap-1 text-[11px]"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-500 font-extrabold ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">
                {t('notes')}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ملاحظات وتفاصيل إضافية..."
                rows={2}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs outline-none"
              />
            </div>

            {/* Quick Pin / Favorite Toggles */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setIsPinned(!isPinned)}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all mr-1.5 ${
                  isPinned
                    ? 'bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-300'
                    : 'bg-stone-200/50 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                }`}
              >
                <Pin className="w-3.5 h-3.5" />
                <span>{t('pin')}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFavorite(!isFavorite)}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ml-1.5 ${
                  isFavorite
                    ? 'bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300'
                    : 'bg-stone-200/50 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>{t('favorite')}</span>
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!title.trim() || !prompt.trim() || !categoryId}
                className="w-full py-3 bg-gradient-to-r from-amber-700 to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-amber-900/20 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all text-center"
              >
                {t('save')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
