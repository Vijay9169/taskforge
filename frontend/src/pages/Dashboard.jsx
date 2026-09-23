import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Plus, Trash2, LogOut } from 'lucide-react';

const COLUMNS = [
  { key: 'todo', label: 'To Do' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'done', label: 'Completed' },
];

export default function Dashboard() {
  const { user, token, logout } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');

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
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-10">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 mb-8 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            TaskForge Workspace
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Active User: <span className="text-slate-200 font-semibold">{user?.name}</span> ({user?.email})
          </p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-200 bg-red-950/40 border border-red-800 rounded-lg hover:bg-red-900/60 transition-colors"
        >
          <LogOut size={16} /> Logout
        </button>
      </header>

      {/* Task Creation Form */}
      <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 mb-8 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
        <input
          type="text"
          placeholder="New Task Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="px-3 py-2 text-sm bg-slate-950 text-slate-100 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-400"
        />
        <input
          type="text"
          placeholder="Short description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="px-3 py-2 text-sm bg-slate-950 text-slate-100 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-400"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="px-3 py-2 text-sm bg-slate-950 text-slate-100 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-400"
        >
          <option value="low">Priority: Low</option>
          <option value="medium">Priority: Medium</option>
          <option value="high">Priority: High</option>
        </select>
        <button
          type="submit"
          className="flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors text-sm"
        >
          <Plus size={16} /> Add Task
        </button>
      </form>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col min-h-[500px]">
              <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-800">
                <span className="font-semibold text-slate-200">{col.label}</span>
                <span className="text-xs px-2.5 py-0.5 bg-slate-800 text-slate-300 rounded-full font-mono">
                  {colTasks.length}
                </span>
              </div>

              <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
                {colTasks.map((task) => (
                  <div
                    key={task._id}
                    className={`p-4 bg-slate-950 rounded-lg border-l-4 ${
                      task.priority === 'high'
                        ? 'border-red-500'
                        : task.priority === 'medium'
                        ? 'border-amber-500'
                        : 'border-emerald-500'
                    } border-y border-r border-slate-800/80 shadow`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-medium text-slate-100 text-sm leading-snug">{task.title}</h4>
                      <button
                        onClick={() => deleteTask(task._id)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="flex justify-between items-center mt-4 pt-2 border-t border-slate-900">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                        task.priority === 'high' ? 'bg-red-950/80 text-red-300' :
                        task.priority === 'medium' ? 'bg-amber-950/80 text-amber-300' :
                        'bg-emerald-950/80 text-emerald-300'
                      }`}>
                        {task.priority}
                      </span>

                      <select
                        value={task.status}
                        onChange={(e) => updateStatus(task._id, e.target.value)}
                        className="bg-slate-900 text-slate-300 border border-slate-700 text-xs rounded px-2 py-1 focus:outline-none"
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Completed</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}