// src/components/TaskCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, BarChart2, Clock } from 'lucide-react';
import { Task } from '../services/dataService';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const navigate = useNavigate();

  const statusStyles = {
    pending: 'bg-[var(--task-muted)] text-[var(--task-text)]',
    inProgress: 'bg-[var(--task-blue)] text-white animate-pulse',
    completed: 'bg-green-100 text-green-800',
  };

  const statusIcons = {
    pending: <Clock size={14} />,
    inProgress: <Clock size={14} />,
    completed: <BarChart2 size={14} />,
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="card animate-slide-up transition-shadow hover:shadow-md">
      <div className="mb-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium truncate">{task.name}</h3>
          <span className={`flex items-center space-x-1 text-xs px-2.5 py-1 rounded-full ${statusStyles[task.status]}`}>
            {statusIcons[task.status]}
            <span>{task.status === 'inProgress' ? 'In Progress' : task.status}</span>
          </span>
        </div>
        <div className="flex items-center text-sm text-muted">
          <Calendar size={14} className="mr-1.5" />
          <span>{getRelativeTime(task.createdAt)}</span>
        </div>
      </div>

      {task.data && (
        <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
          <div className="bg-[var(--task-muted)] rounded-md p-2">
            <div className="text-muted text-xs">Records</div>
            <div className="font-semibold">{task.data.length}</div>
          </div>
          <div className="bg-[var(--task-muted)] rounded-md p-2">
            <div className="text-muted text-xs">Companies</div>
            <div className="font-semibold">
              {Array.from(new Set(task.data.map(d => d.company))).length}
            </div>
          </div>
          <div className="bg-[var(--task-muted)] rounded-md p-2">
            <div className="text-muted text-xs">Avg Price</div>
            <div className="font-semibold">
              ${task.data.length > 0
                ? (task.data.reduce((sum, d) => sum + Number(d.price), 0) / task.data.length).toFixed(2)
                : '0.00'}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => navigate(`/tasks/${task.id}`)}
        disabled={task.status !== 'completed'}
        className={`btn w-full text-sm justify-center ${
          task.status !== 'completed' ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {task.status === 'completed' ? (
          <>
            <BarChart2 size={16} className="mr-2" />
            View Analytics
          </>
        ) : (
          <>
            <Clock size={16} className="mr-2 animate-pulse" />
            Processing...
          </>
        )}
      </button>
    </div>
  );
};

export default TaskCard;
