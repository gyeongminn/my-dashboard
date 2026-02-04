'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Calendar, Tag, AlertCircle } from 'lucide-react';

export default function TaskModal({ task, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    status: '📥 대기',
    area: '',
    priority: '🟢 보통',
    dueDate: '',
    memo: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        status: task.status || '📥 대기',
        area: task.area || '',
        priority: task.priority || '🟢 보통',
        dueDate: task.dueDate || '',
        memo: task.memo || '',
      });
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('작업명을 입력해주세요');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onSave(task?.id, formData);
      onClose();
    } catch (err) {
      setError(err.message || '저장 중 오류가 발생했습니다');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-surface-900 border border-white/10 rounded-2xl shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold">
            {task ? '작업 수정' : '새 작업 추가'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              작업명 <span className="text-red-400">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-surface-800/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              placeholder="작업명을 입력하세요"
              autoFocus
            />
          </div>

          {/* Status and Priority Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-2">
                상태
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-surface-800/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              >
                <option value="📥 대기">📥 대기</option>
                <option value="⏳ 진행중">⏳ 진행중</option>
                <option value="📦 보류">📦 보류</option>
                <option value="✅ 완료">✅ 완료</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium mb-2">
                우선순위
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-3 bg-surface-800/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              >
                <option value="🟤 낮음">🟤 낮음</option>
                <option value="🟢 보통">🟢 보통</option>
                <option value="🟡 중요">🟡 중요</option>
                <option value="🔴 긴급">🔴 긴급</option>
              </select>
            </div>
          </div>

          {/* Area and Due Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Area */}
            <div>
              <label htmlFor="area" className="block text-sm font-medium mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                영역
              </label>
              <select
                id="area"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-4 py-3 bg-surface-800/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              >
                <option value="">선택 안함</option>
                <option value="💼 업무">💼 업무</option>
                <option value="🏠 개인">🏠 개인</option>
                <option value="📚 학습">📚 학습</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                마감일
              </label>
              <input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-3 bg-surface-800/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Memo */}
          <div>
            <label htmlFor="memo" className="block text-sm font-medium mb-2">
              메모
            </label>
            <textarea
              id="memo"
              value={formData.memo}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-surface-800/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all resize-none"
              placeholder="추가 정보나 메모를 입력하세요"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-surface-800/60 hover:bg-surface-800 border border-white/10 rounded-xl transition-all"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-accent hover:bg-accent-light disabled:bg-surface-800 disabled:text-surface-200 rounded-xl font-medium transition-all flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                '저장'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
