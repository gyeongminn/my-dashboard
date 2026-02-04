'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  ListTodo,
  RefreshCw,
  Repeat,
  ExternalLink,
  AlertCircle,
  Loader2,
  Inbox,
  PlayCircle,
  LogOut,
  Plus
} from 'lucide-react';
import TaskModal from './components/TaskModal';

const REFRESH_INTERVAL = parseInt(process.env.NEXT_PUBLIC_REFRESH_INTERVAL || '60000');

export default function Dashboard() {
  const [notionData, setNotionData] = useState(null);
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [notionRes, calendarRes] = await Promise.all([
        fetch('/api/notion?type=all'),
        fetch('/api/calendar?type=upcoming&days=7'),
      ]);

      const notion = await notionRes.json();
      const calendar = await calendarRes.json();

      if (notion.success) setNotionData(notion.data);
      if (calendar.success) setCalendarData(calendar.events);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  const handleAddTask = () => {
    setSelectedTask(null);
    setModalOpen(true);
  };

  const handleSaveTask = async (taskId, formData) => {
    try {
      const url = '/api/notion/task';
      const method = taskId ? 'PATCH' : 'POST';
      const body = taskId ? { id: taskId, ...formData } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '저장 실패');
      }

      // 데이터 새로고침
      await fetchData();
    } catch (error) {
      console.error('Save task error:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
          <p className="text-surface-200">대시보드 로딩중...</p>
        </div>
      </div>
    );
  }

  // 캘린더 이벤트와 작업 마감일을 합쳐서 처리
  const allEvents = [
    ...(calendarData || []).map(e => ({ ...e, type: 'calendar' })),
    ...(notionData?.tasks?.inProgress || [])
      .filter(t => t.dueDate)
      .map(t => ({
        type: 'task',
        start: t.dueDate,
        title: t.title,
        task: t
      })),
    ...(notionData?.tasks?.waiting || [])
      .filter(t => t.dueDate)
      .map(t => ({
        type: 'task',
        start: t.dueDate,
        title: t.title,
        task: t
      })),
    ...(notionData?.tasks?.onHold || [])
      .filter(t => t.dueDate)
      .map(t => ({
        type: 'task',
        start: t.dueDate,
        title: t.title,
        task: t
      })),
  ];

  const todayEvents = allEvents.filter(e => {
    const eventDate = parseISO(e.start);
    return isToday(eventDate);
  });

  const upcomingEvents = allEvents
    .filter(e => {
      const eventDate = parseISO(e.start);
      return !isToday(eventDate);
    })
    .sort((a, b) => parseISO(a.start) - parseISO(b.start));

  return (
    <main className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <header className="mb-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold bg-gradient-to-r from-white via-white to-surface-200 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-surface-200 mt-1">
              {format(new Date(), 'yyyy년 M월 d일 EEEE', { locale: ko })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-sm text-surface-200">
                마지막 업데이트: {format(lastUpdated, 'HH:mm:ss')}
              </span>
            )}
            <button
              onClick={handleAddTask}
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-light border border-accent/50 rounded-xl transition-all duration-200 font-medium"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">새 작업</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-surface-800/60 hover:bg-surface-800 border border-white/10 rounded-xl transition-all duration-200 hover:border-accent/50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm">새로고침</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-surface-800/60 hover:bg-surface-800 border border-white/10 rounded-xl transition-all duration-200 hover:border-red-500/50"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">로그아웃</span>
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Calendar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Today's Schedule */}
          <section className="card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Calendar className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-lg font-semibold">오늘 일정</h2>
              <span className="ml-auto text-sm text-surface-200">
                {todayEvents.length}개
              </span>
            </div>
            <div className="space-y-3">
              {todayEvents.length === 0 ? (
                <p className="text-surface-200 text-sm py-4 text-center">
                  오늘 예정된 일정이 없습니다
                </p>
              ) : (
                todayEvents.map((event, idx) => (
                  <EventCard
                    key={event.id || idx}
                    event={event}
                    onTaskClick={event.type === 'task' ? () => handleTaskClick(event.task) : undefined}
                  />
                ))
              )}
            </div>
          </section>

          {/* Upcoming Events */}
          <section className="card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold">다가오는 일정</h2>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {upcomingEvents.length === 0 ? (
                <p className="text-surface-200 text-sm py-4 text-center">
                  예정된 일정이 없습니다
                </p>
              ) : (
                upcomingEvents.slice(0, 5).map((event, idx) => (
                  <EventCard
                    key={event.id || idx}
                    event={event}
                    showDate
                    onTaskClick={event.type === 'task' ? () => handleTaskClick(event.task) : undefined}
                  />
                ))
              )}
            </div>
          </section>
        </div>

        {/* Middle Column - Tasks */}
        <div className="lg:col-span-1 space-y-6">
          {/* In Progress */}
          <section className="card p-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <PlayCircle className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold">진행중</h2>
              <span className="ml-auto badge badge-progress">
                {notionData?.tasks?.inProgress?.length || 0}
              </span>
            </div>
            <div className="space-y-2">
              {notionData?.tasks?.inProgress?.length === 0 ? (
                <p className="text-surface-200 text-sm py-4 text-center">
                  진행중인 작업이 없습니다
                </p>
              ) : (
                notionData?.tasks?.inProgress?.map((task, idx) => (
                  <TaskCard key={task.id || idx} task={task} onClick={() => handleTaskClick(task)} />
                ))
              )}
            </div>
          </section>

          {/* Waiting */}
          <section className="card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Inbox className="w-5 h-5 text-amber-400" />
              </div>
              <h2 className="text-lg font-semibold">대기</h2>
              <span className="ml-auto badge badge-waiting">
                {notionData?.tasks?.waiting?.length || 0}
              </span>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {notionData?.tasks?.waiting?.length === 0 ? (
                <p className="text-surface-200 text-sm py-4 text-center">
                  대기중인 작업이 없습니다
                </p>
              ) : (
                notionData?.tasks?.waiting?.map((task, idx) => (
                  <TaskCard key={task.id || idx} task={task} onClick={() => handleTaskClick(task)} />
                ))
              )}
            </div>
          </section>

          {/* On Hold */}
          <section className="card p-6 animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-500/20 rounded-lg">
                <ListTodo className="w-5 h-5 text-gray-400" />
              </div>
              <h2 className="text-lg font-semibold">보류</h2>
              <span className="ml-auto badge badge-hold">
                {notionData?.tasks?.onHold?.length || 0}
              </span>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {notionData?.tasks?.onHold?.length === 0 ? (
                <p className="text-surface-200 text-sm py-4 text-center">
                  보류중인 작업이 없습니다
                </p>
              ) : (
                notionData?.tasks?.onHold?.map((task, idx) => (
                  <TaskCard key={task.id || idx} task={task} onClick={() => handleTaskClick(task)} />
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Column - Routines, Completed */}
        <div className="lg:col-span-1 space-y-6">
          {/* Routines */}
          <section className="card p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Repeat className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-lg font-semibold">루틴</h2>
            </div>
            <div className="space-y-2">
              {notionData?.routines?.length === 0 ? (
                <p className="text-surface-200 text-sm py-4 text-center">
                  등록된 루틴이 없습니다
                </p>
              ) : (
                notionData?.routines?.slice(0, 6).map((routine, idx) => (
                  <RoutineCard key={routine.id || idx} routine={routine} />
                ))
              )}
            </div>
          </section>

          {/* Recently Completed */}
          <section className="card p-6 animate-slide-up" style={{ animationDelay: '0.35s' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold">최근 완료</h2>
            </div>
            <div className="space-y-2">
              {notionData?.tasks?.completed?.length === 0 ? (
                <p className="text-surface-200 text-sm py-4 text-center">
                  최근 완료한 작업이 없습니다
                </p>
              ) : (
                notionData?.tasks?.completed?.map((task, idx) => (
                  <CompletedTaskCard key={task.id || idx} task={task} onClick={() => handleTaskClick(task)} />
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Task Modal */}
      {modalOpen && (
        <TaskModal
          task={selectedTask}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveTask}
        />
      )}
    </main>
  );
}

// Event Card Component
function EventCard({ event, showDate = false, onTaskClick }) {
  // 작업 마감일인 경우
  if (event.type === 'task') {
    const task = event.task;
    const eventDate = parseISO(event.start);
    const dateLabel = showDate
      ? format(eventDate, 'M/d (E)', { locale: ko })
      : null;

    const priorityClass = {
      '🔴 긴급': 'priority-urgent',
      '🟡 중요': 'priority-important',
      '🟢 보통': 'priority-normal',
      '🟤 낮음': 'priority-low',
    }[task.priority] || '';

    // 오늘 마감인지 확인
    const dueDateLabel = isToday(eventDate) ? '오늘 마감' : '마감';

    return (
      <div
        onClick={(e) => {
          e.preventDefault();
          onTaskClick?.();
        }}
        className="block p-3 bg-surface-900/50 hover:bg-surface-900 rounded-xl border border-white/5 hover:border-accent/30 transition-all duration-200 group cursor-pointer"
      >
        <div className="flex items-start gap-3">
          <div className="text-amber-400 font-mono text-sm mt-0.5 min-w-[70px]">
            {dueDateLabel}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Circle className={`w-3 h-3 flex-shrink-0 ${priorityClass}`} />
              <span className="font-medium truncate">{task.title}</span>
              <ExternalLink className="w-3 h-3 text-surface-200 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-surface-200">
              <span>{task.area}</span>
              {showDate && (
                <>
                  <span>•</span>
                  <span className={isOverdue(task.dueDate) ? 'text-red-400' : isTomorrow(parseISO(task.dueDate)) ? 'text-amber-400' : ''}>
                    {dateLabel}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 캘린더 이벤트인 경우
  const startTime = event.isAllDay
    ? '종일'
    : format(parseISO(event.start), 'HH:mm');

  const dateLabel = showDate
    ? format(parseISO(event.start), 'M/d (E)', { locale: ko })
    : null;

  return (
    <a
      href={event.htmlLink}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-3 bg-surface-900/50 hover:bg-surface-900 rounded-xl border border-white/5 hover:border-accent/30 transition-all duration-200 group"
    >
      <div className="flex items-start gap-3">
        <div className="text-accent font-mono text-sm mt-0.5 min-w-[50px]">
          {startTime}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{event.title}</span>
            <ExternalLink className="w-3 h-3 text-surface-200 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>
          {showDate && (
            <span className="text-xs text-surface-200">{dateLabel}</span>
          )}
          {event.location && (
            <p className="text-xs text-surface-200 truncate mt-1">
              📍 {event.location}
            </p>
          )}
        </div>
      </div>
    </a>
  );
}

// Task Card Component
function TaskCard({ task, onClick }) {
  const priorityClass = {
    '🔴 긴급': 'priority-urgent',
    '🟡 중요': 'priority-important',
    '🟢 보통': 'priority-normal',
    '🟤 낮음': 'priority-low',
  }[task.priority] || '';

  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
      }}
      className="block p-3 bg-surface-900/50 hover:bg-surface-900 rounded-xl border border-white/5 hover:border-accent/30 transition-all duration-200 group cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <Circle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${priorityClass}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{task.title}</span>
            <ExternalLink className="w-3 h-3 text-surface-200 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-surface-200">
            <span>{task.area}</span>
            {task.dueDate && (
              <>
                <span>•</span>
                <span className={isOverdue(task.dueDate) ? 'text-red-400' : ''}>
                  마감: {format(parseISO(task.dueDate), 'M/d')}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Routine Card Component
function RoutineCard({ routine }) {
  return (
    <a
      href={routine.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 bg-surface-900/50 hover:bg-surface-900 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all duration-200 group"
    >
      {routine.completed ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
      ) : (
        <Circle className="w-4 h-4 text-surface-200 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <span className={`truncate ${routine.completed ? 'line-through text-surface-200' : ''}`}>
          {routine.title}
        </span>
      </div>
      <span className="text-xs text-surface-200 flex-shrink-0">{routine.frequency}</span>
    </a>
  );
}

// Completed Task Card Component
function CompletedTaskCard({ task, onClick }) {
  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
      }}
      className="flex items-center gap-3 p-3 bg-surface-900/50 hover:bg-surface-900 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all duration-200 group cursor-pointer"
    >
      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
      <span className="truncate text-surface-200">{task.title}</span>
      {task.completedDate && (
        <span className="text-xs text-surface-200 ml-auto flex-shrink-0">
          {format(parseISO(task.completedDate), 'M/d')}
        </span>
      )}
    </div>
  );
}

// Helper function
function isOverdue(dateString) {
  const date = parseISO(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}
