// src/pages/TasksPage.tsx
import React, { useState, useEffect } from "react";
import { DataService, Task } from "../services/dataService";
import Layout from "../components/Layout";
import { CreateTaskModal } from "../components/CreateTaskModal";
import TaskCard from "../components/TaskCard";
import { BarChart2, Plus, Search, Filter } from "lucide-react";

const TaskPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const data = await DataService.getTasks();
      setTasks(data);
    } catch (err) {
      console.error("❌ Failed to fetch tasks", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <BarChart2 className="mr-2 text-[var(--task-blue)]" />
              Tasks Management
            </h1>
            <p className="text-muted text-sm">
              Create and analyze data sourcing tasks with filters, summaries, and charts.
            </p>
          </div>

          <button onClick={() => setIsCreateModalOpen(true)} className="btn flex items-center">
            <Plus size={18} className="mr-2" />
            New Task
          </button>
        </div>

        <div className="card">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between mb-4">
            <div className="relative w-full md:w-72">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter size={18} className="text-muted" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="select"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="inProgress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Task list or empty state */}
          {isLoading ? (
            <div className="text-center py-12 text-muted">Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="border border-dashed rounded-lg p-8 text-center text-muted">
              {searchTerm || statusFilter !== "all" ? (
                <div className="space-y-2">
                  <p>No matching tasks found.</p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                    className="text-[var(--task-blue)] hover:underline text-sm"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p>No tasks yet. Start by creating your first task.</p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="text-[var(--task-blue)] hover:underline text-sm"
                  >
                    Create a new task
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateTaskModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={loadTasks}
      />
    </Layout>
  );
};

export default TaskPage;
