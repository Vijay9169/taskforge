import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Plus, Trash2, LogOut, CheckCircle2, Clock, CircleDot, GripVertical, LayoutGrid } from 'lucide-react';

const COLUMNS = [
  { 
    key: 'todo', 
    label: 'To Do', 
    icon: CircleDot, 
    bg: 'bg-amber-100/70',
    border: 'border-amber-300',
    headerBadge: 'bg-amber-600 text-white',
    countBadge: 'bg-amber-200/90 text-amber-900 border-amber-400' 
  },
  { 
    key: 'in-progress', 
    label: 'In Progress', 
    icon: Clock, 
    bg: 'bg-sky-100/70',
    border: 'border-sky-300',
    headerBadge: 'bg-sky-600 text-white',
    countBadge: 'bg-sky-200/90 text-sky-900 border-sky-400' 
  },
  { 
    key: 'done', 
    label: 'Completed', 
    icon: CheckCircle2, 
    bg: 'bg-emerald-100/70',
    border: 'border-emerald-300',
    headerBadge: 'bg-emerald-600 text-white',
    countBadge: 'bg-emerald-200/90 text-emerald-900 border-emerald-400' 
  },
];

export default function Dashboard() {
  const { user, token, logout } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [draggedTaskId, setDraggedTaskId] = useState(null);

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
    if (!title.trim()) return;

    try {
      const res = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, priority, status: 'todo' }),
      });
      if (res.ok) {
        setTitle('');
        setDescription('');
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
      fetchTasks();
    }
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

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, columnStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      updateStatus(taskId, columnStatus);
      setDraggedTaskId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-6 md:p-10 font-sans">
      {/* Top Navbar */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 mb-7 gap-4 bg-white border border-slate-300 px-6 py-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-300">
            <LayoutGrid size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              TaskForge <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">Kanban</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Workspace: <span className="text-slate-800 font-semibold">{user?.name}</span> ({user?.email})
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition shadow-sm"
        >
          <LogOut size={14} /> Exit Board
        </button>
      </header>

      {/* Creation Bar */}
      <form
        onSubmit={handleCreateTask}
        className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3.5 mb-8 bg-white border border-slate-300 rounded-2xl shadow-sm"
      >
        <div className="md:col-span-5">
          <input
            type="text"
            placeholder="Add task title (e.g. Build API integration)..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2.5 text-sm bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition"
          />
        </div>

        <div className="md:col-span-4">
          <input
            type="text"
            placeholder="Short details or requirements..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition"
          />
        </div>

        <div className="md:col-span-2">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-slate-50 text-slate-800 font-medium border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition cursor-pointer"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>

        <div className="md:col-span-1">
          <button
            type="submit"
            className="w-full h-full min-h-[42px] flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition shadow-md shadow-indigo-200 active:scale-95 cursor-pointer"
            title="Create Task"
          >
            <Plus size={20} />
          </button>
        </div>
      </form>

      {/* High Contrast Colorful Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          const Icon = col.icon;

          return (
            <div
              key={col.key}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.key)}
              className={`${col.bg} border-2 ${col.border} rounded-2xl p-4 flex flex-col min-h-[580px] shadow-md transition-all`}
            >
              {/* Header with Darker Colored Accent */}
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

              {/* Cards Container */}
              <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
                {colTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-44 border-2 border-dashed border-black/15 rounded-xl text-slate-500 text-xs gap-1 select-none font-medium">
                    <span>No tasks in this lane</span>
                    <span className="text-[11px] text-slate-400">Drag or drop cards here</span>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task._id)}
                      className="group p-4 bg-white hover:bg-slate-50 rounded-xl border border-slate-300/90 hover:border-slate-400 transition-all duration-150 shadow-md cursor-grab active:cursor-grabbing"
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
                        <button
                          onClick={() => deleteTask(task._id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition p-1"
                          title="Delete Task"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-600 mt-2 pl-6 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Card Meta & Actions */}
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
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}