// src/pages/TaskDetailPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DataService } from "../services/dataService";
import Layout from "../components/Layout";
import { ArrowLeft, Calendar, BarChart2, Download, Search, Filter } from "lucide-react";

const TaskDetailPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  const [taskMeta, setTaskMeta] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const recordsPerPage = 20;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Reset when filters/search change
  useEffect(() => {
    setCurrentPage(1);
    setRecords([]);
  }, [sourceFilter, companyFilter, searchQuery]);

  useEffect(() => {
    const fetchTaskMeta = async () => {
      try {
        const tasks = await DataService.getTasks();
        const task = tasks.find((t) => t.id.toString() === taskId);
        if (task) setTaskMeta(task);
      } catch (err) {
        console.error("❌ Failed to fetch task metadata", err);
      }
    };

    if (taskId) fetchTaskMeta();
  }, [taskId]);

  useEffect(() => {
    if (!taskId) return;
    const loadRecords = async () => {
      try {
        setLoading(true);
        const data = await DataService.getTaskRecords(
          taskId,
          currentPage,
          sourceFilter,
          companyFilter
        );

        setRecords((prev) =>
          currentPage === 1 ? data.records : [...prev, ...data.records]
        );
        setTotalRecords(data.total);
      } catch (err) {
        console.error("❌ Failed to load records", err);
      } finally {
        setLoading(false);
      }
    };
    loadRecords();
  }, [taskId, currentPage, sourceFilter, companyFilter]);

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <button
          onClick={() => navigate("/tasks")}
          className="flex items-center text-[var(--task-blue)] hover:underline"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Tasks
        </button>

        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold">{taskMeta?.name}</h2>
              <div className="flex items-center text-sm text-muted mt-1">
                <Calendar size={14} className="mr-1.5" />
                <span>
                  Created {taskMeta?.createdAt && new Date(taskMeta.createdAt).toLocaleDateString()}
                </span>
                <span className="mx-2">•</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    taskMeta?.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : taskMeta?.status === "inProgress"
                      ? "bg-[var(--task-blue)] text-white animate-pulse"
                      : "bg-[var(--task-muted)] text-[var(--task-text)]"
                  }`}
                >
                  {taskMeta?.status}
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => navigate(`/tasks/${taskId}/visualization`)}
                className="btn flex items-center"
              >
                <BarChart2 size={16} className="mr-2" />
                View Analytics
              </button>
              <a
                href={`http://localhost:5001/api/tasks/${taskId}/records/download`}
                className="btn-outline"
                download
              >
                <Download size={16} className="mr-2" />
                Export CSV
              </a>
            </div>
          </div>

          <div className="text-sm text-muted mt-2">
            <div>Start Date: {taskMeta?.startDate || "N/A"}</div>
            <div>End Date: {taskMeta?.endDate || "N/A"}</div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 my-4">
            <div className="relative w-full sm:w-72">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                placeholder="Search records..."
                className="input pl-9"
                value={searchQuery}
                onChange={(e) => {
                  setCurrentPage(1);
                  setSearchQuery(e.target.value);
                }}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-muted" />
              <label className="text-sm font-medium">Source:</label>
              <select
                className="select"
                value={sourceFilter}
                onChange={(e) => {
                  setCurrentPage(1);
                  setSourceFilter(e.target.value);
                }}
              >
                <option value="all">All Sources</option>
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-muted" />
              <label className="text-sm font-medium">Company:</label>
              <select
                className="select"
                value={companyFilter}
                onChange={(e) => {
                  setCurrentPage(1);
                  setCompanyFilter(e.target.value);
                }}
              >
                <option value="all">All Companies</option>
                {taskMeta?.companies?.map((company: string) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-[var(--task-border)] rounded">
            {records.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-[var(--task-muted)] text-muted">
                  <tr>
                    <th className="px-4 py-3 text-left">Company</th>
                    <th className="px-4 py-3 text-left">Model</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-left">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--task-border)]">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-[var(--task-muted)]/40">
                      <td className="px-4 py-3">{r.company}</td>
                      <td className="px-4 py-3">{r.model}</td>
                      <td className="px-4 py-3">{r.date}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        ${Number(r.price).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-3">{r.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-6 text-muted">No records found.</div>
            )}
          </div>

          {/* Load More */}
          {totalPages > 1 && currentPage < totalPages && (
            <div className="flex justify-center mt-6">
              <button className="btn" onClick={() => setCurrentPage((prev) => prev + 1)}>
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TaskDetailPage;
