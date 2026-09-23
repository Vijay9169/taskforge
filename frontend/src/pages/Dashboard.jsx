import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  Plus, Trash2, LogOut, CheckCircle2, Clock, CircleDot, 
  GripVertical, X, ShieldCheck, Search, Filter, 
  Pencil, Save, Calendar, Timer, CheckCircle, PlusCircle, RotateCcw
} from 'lucide-react';

const COLUMNS = [
  { 
    key: 'todo', 
    label: 'To Do', 
    icon: CircleDot, 
    bg: 'bg-amber-100/70',
    border: 'border-amber-300',
    dragOverGlow: 'ring-4 ring-amber-400/50 border-amber-500 scale-[1.01]',
    headerBadge: 'bg-amber-600 text-white',
    countBadge: 'bg-amber-200/90 text-amber-900 border-amber-400' 
  },
  { 
    key: 'in-progress', 
    label: 'In Progress', 
    icon: Clock, 
    bg: 'bg-sky-100/70',
    border: 'border-sky-300',
    dragOverGlow: 'ring-4 ring-sky-400/50 border-sky-500 scale-[1.01]',
    headerBadge: 'bg-sky-600 text-white',
    countBadge: 'bg-sky-200/90 text-sky-900 border-sky-400' 
  },
  { 
    key: 'done', 
    label: 'Completed', 
    icon: CheckCircle2, 
    bg: 'bg-emerald-100/70',
    border: 'border-emerald-300',
    dragOverGlow: 'ring-4 ring-emerald-400/50 border-emerald-500 scale-[1.01]',
    headerBadge: 'bg-emerald-600 text-white',
    countBadge: 'bg-emerald-200/90 text-emerald-900 border-emerald-400' 
  },
];

function formatDuration(startDate, endDate = new Date()) {
  if (!startDate) return 'Just started';
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const diffInMinutes = Math.max(0, Math.floor((end - start) / (1000 * 60)));

  if (diffInMinutes < 1) return 'less than 1m';
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  
  const hours = Math.floor(diffInMinutes / 60);
  const remainingMins = diffInMinutes % 60;
  if (hours < 24) {
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}

function formatDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Dashboard() {
  const { user, token, logout } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [activeDropColumn, setActiveDropColumn] = useState(null);
  
  // Modals & Toolbar States
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Create Task Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newStatus, setNewStatus] = useState('todo');

  // Edit Task State
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', priority: 'medium', status: 'todo' });

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setTasks(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchTasks();
  }, [token]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          title: newTitle, 
          description: newDescription, 
          priority: newPriority, 
          status: newStatus 
        }),
      });
      if (res.ok) {
        setNewTitle('');
        setNewDescription('');
        setNewPriority('medium');
        setNewStatus('todo');
        setShowCreateModal(false);
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (taskId, newStatusValue) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatusValue } : t))
    );

    try {
      await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatusValue }),
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
      fetchTasks();
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${editingTask._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        setEditingTask(null);
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setEditForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
    });
  };

  const deleteTask = async (taskId) => {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    try {
      await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error(err);
      fetchTasks();
    }
  };

  const handleDragStart = (e, id) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e, columnKey) => {
    e.preventDefault();
    if (activeDropColumn !== columnKey) {
      setActiveDropColumn(columnKey);
    }
  };

  const handleDragLeave = () => {
    setActiveDropColumn(null);
  };

  const handleDrop = (e, columnStatus) => {
    e.preventDefault();
    setActiveDropColumn(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      updateStatus(taskId, columnStatus);
      setDraggedTaskId(null);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setPriorityFilter('all');
  };

  // Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length;
  const todoTasks = tasks.filter((t) => t.status === 'todo').length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPriority =
        priorityFilter === 'all' || task.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, priorityFilter]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-6 md:p-10 font-sans relative">
      {/* Top Navbar Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 mb-6 gap-4 bg-white border border-slate-300 px-6 py-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowProfileModal(true)}
            title="Open Member Profile & Stats"
            className="h-11 w-11 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm flex items-center justify-center shadow-md shadow-indigo-300 transition transform hover:scale-105 cursor-pointer ring-2 ring-indigo-400/40"
          >
            {getInitials(user?.name)}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                TaskForge
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                Kanban
              </span>
            </div>
            <button
              onClick={() => setShowProfileModal(true)}
              className="text-xs text-slate-500 hover:text-indigo-600 font-medium transition text-left cursor-pointer flex items-center gap-1 mt-0.5"
            >
              <span>Workspace:</span> <strong className="text-slate-800 underline decoration-slate-300">{user?.name}</strong>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-md shadow-indigo-200 active:scale-95 cursor-pointer"
          >
            <Plus size={16} /> Create Task
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition shadow-sm cursor-pointer"
          >
            <LogOut size={14} /> Exit Board
          </button>
        </div>
      </header>

      {/* WORKSPACE ANALYTICS STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
        <div className="p-4 bg-white border border-slate-300 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block">Total Pipeline</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">{totalTasks}</span>
            <span className="text-[11px] text-slate-400">tasks registered</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-amber-300 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-amber-700 block">To Do (Pending)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-amber-900">{todoTasks}</span>
            <span className="text-[11px] text-amber-600">awaiting pick-up</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-sky-300 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-sky-700 block">In Progress (Active)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-sky-900">{inProgressTasks}</span>
            <span className="text-[11px] text-sky-600">currently running</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-emerald-300 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-emerald-700 block">Completed</span>
            <span className="text-xs font-black text-emerald-600">{completionPercentage}%</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1 mb-2">
            <span className="text-2xl font-black text-emerald-900">{completedTasks}</span>
            <span className="text-[11px] text-emerald-600">tasks shipped</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Search & Priority Filter Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 mb-7 p-3 bg-white border border-slate-300 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Filter size={12} /> Filter:
          </span>
          {[
            { id: 'all', label: 'All' },
            { id: 'high', label: 'High' },
            { id: 'medium', label: 'Medium' },
            { id: 'low', label: 'Low' },
          ].map((pill) => {
            const isActive = priorityFilter === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setPriorityFilter(pill.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Columns Grid with Live Drag Hover Physics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.key);
          const Icon = col.icon;
          const isOver = activeDropColumn === col.key;

          return (
            <div
              key={col.key}
              onDragOver={(e) => handleDragOver(e, col.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.key)}
              className={`${col.bg} border-2 ${col.border} ${isOver ? col.dragOverGlow : ''} rounded-2xl p-4 flex flex-col min-h-[580px] shadow-md transition-all duration-200`}
            >
              <div className="flex justify-between items-center pb-3.5 mb-4 border-b border-black/10">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${col.headerBadge} shadow-sm`}>
                    <Icon size={16} />
                  </div>
                  <span className="font-bold text-sm text-slate-900 tracking-wide">
                    {col.label}
                  </span>
                </div>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${col.countBadge}`}>
                  {colTasks.length}
                </span>
              </div>

              <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
                {colTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-black/15 rounded-xl text-slate-500 text-xs gap-2 select-none font-medium px-4 text-center">
                    <span>
                      {searchQuery || priorityFilter !== 'all'
                        ? 'No matching tasks found'
                        : 'No tasks in this lane'}
                    </span>
                    {(searchQuery || priorityFilter !== 'all') ? (
                      <button
                        onClick={resetFilters}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-indigo-600 font-bold hover:bg-slate-50 transition cursor-pointer text-[11px]"
                      >
                        <RotateCcw size={12} /> Clear Filter
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        Drag or drop cards here
                      </span>
                    )}
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const completionDate = task.completedAt || (task.status === 'done' ? task.updatedAt : null);

                    return (
                      <div
                        key={task._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task._id)}
                        className="group p-4 bg-white hover:bg-slate-50 rounded-xl border border-slate-300/90 hover:border-slate-400 transition-all duration-150 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing hover:-translate-y-0.5"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-start gap-2">
                            <GripVertical
                              size={15}
                              className="text-slate-400 group-hover:text-slate-600 mt-0.5 flex-shrink-0"
                            />
                            <h4 className="font-bold text-slate-900 text-sm leading-snug">
                              {task.title}
                            </h4>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                            <button
                              onClick={() => openEditModal(task)}
                              className="text-slate-400 hover:text-indigo-600 transition p-1 cursor-pointer"
                              title="Edit Task"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => deleteTask(task._id)}
                              className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
                              title="Delete Task"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {task.description && (
                          <p className="text-xs text-slate-600 mt-2 pl-6 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Lifecycle Metrics */}
                        <div className="mt-3 pl-6 flex flex-wrap items-center gap-2 text-[10px] text-slate-500 font-medium">
                          <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            <Calendar size={10} className="text-slate-400" />
                            Created: {formatDateTime(task.createdAt)}
                          </span>

                          {task.status === 'in-progress' && task.startedAt && (
                            <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md border border-sky-200 font-semibold animate-pulse">
                              <Timer size={10} />
                              In Progress: {formatDuration(task.startedAt)}
                            </span>
                          )}

                          {task.status === 'done' && completionDate && (
                            <span className="inline-flex items-center gap-1 bg-emerald-50/70 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200 font-medium">
                              <CheckCircle size={10} className="text-emerald-600" />
                              Completed: {formatDateTime(completionDate)}
                            </span>
                          )}

                          {task.status === 'done' && (
                            <span className="inline-flex items-center gap-1 bg-emerald-100/80 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-300 font-bold">
                              <CheckCircle2 size={10} className="text-emerald-700" />
                              Done in: {formatDuration(task.startedAt || task.createdAt, completionDate)}
                            </span>
                          )}
                        </div>

                        {/* Card Bottom: Priority & Status Selector */}
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 pl-6">
                          <span
                            className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                              task.priority === 'high'
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : task.priority === 'medium'
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            }`}
                          >
                            {task.priority}
                          </span>

                          <select
                            value={task.status}
                            onChange={(e) => updateStatus(task._id, e.target.value)}
                            className="bg-slate-100 text-slate-800 font-medium border border-slate-300 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-600 cursor-pointer"
                          >
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="done">Completed</option>
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE TASK MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white border border-slate-300 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition p-1 rounded-lg cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-200">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <PlusCircle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Create New Task</h3>
                <p className="text-xs text-slate-500">Add a work item to your Kanban board</p>
              </div>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Build API integration..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description / Context
                </label>
                <textarea
                  rows={3}
                  placeholder="Add details, steps, or requirements..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Priority Level
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 text-slate-800 font-medium border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Initial Lane
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 text-slate-800 font-medium border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Completed</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-md shadow-indigo-200 cursor-pointer"
                >
                  <Plus size={15} /> Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white border border-slate-300 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setEditingTask(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition p-1 rounded-lg cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-200">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Pencil size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Task</h3>
                <p className="text-xs text-slate-500">Update task details and workflow properties</p>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Task context or notes..."
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Priority
                  </label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 text-slate-800 font-medium border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Status Lane
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 text-slate-800 font-medium border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Completed</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-md shadow-indigo-200 cursor-pointer"
                >
                  <Save size={14} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white border border-slate-300 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition p-1 rounded-lg cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-4 pb-5 border-b border-slate-200">
              <div className="h-16 w-16 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                {getInitials(user?.name)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
                <p className="text-xs text-slate-500">{user?.email}</p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-1.5">
                  <ShieldCheck size={11} /> Verified Member
                </span>
              </div>
            </div>

            <div className="mt-5">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Workspace Productivity
              </h4>

              <div className="grid grid-cols-3 gap-2.5 mb-4">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-center">
                  <span className="block text-lg font-black text-amber-900">{todoTasks}</span>
                  <span className="text-[10px] font-semibold text-amber-700 uppercase">To Do</span>
                </div>
                <div className="p-3 bg-sky-50 border border-sky-200 rounded-2xl text-center">
                  <span className="block text-lg font-black text-sky-900">{inProgressTasks}</span>
                  <span className="text-[10px] font-semibold text-sky-700 uppercase">Active</span>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                  <span className="block text-lg font-black text-emerald-900">{completedTasks}</span>
                  <span className="text-[10px] font-semibold text-emerald-700 uppercase">Done</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                  <span className="text-slate-600">Completion Ratio</span>
                  <span className="text-indigo-600">{completionPercentage}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-md shadow-indigo-200 cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}