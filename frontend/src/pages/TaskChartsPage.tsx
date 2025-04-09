// src/pages/TaskChartsPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Bar, Line } from "react-chartjs-2";
import Layout from "../components/Layout";
import { ArrowLeft, BarChart2, Filter, Download } from "lucide-react";
import { DataService } from "../services/dataService";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TaskChartsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [companyFilter, setCompanyFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [taskMeta, setTaskMeta] = useState<any>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await DataService.getSummary(id!);
        setSummary(data);
      } catch (err) {
        setError("Could not load analytics.");
      } finally {
        setLoading(false);
      }
    };

    const fetchTaskInfo = async () => {
      const allTasks = await DataService.getTasks();
      const task = allTasks.find((t) => t.id.toString() === id);
      if (task) setTaskMeta(task);
    };

    if (id) {
      fetchSummary();
      fetchTaskInfo();
    }
  }, [id]);

  const allCompanies = Object.keys(summary?.companyCounts || {});

  const isWithinDateRange = (date: string) => {
    const dateObj = new Date(date);
    const isAfterStart = startDate ? dateObj >= new Date(startDate) : true;
    const isBeforeEnd = endDate ? dateObj <= new Date(endDate) : true;
    return isAfterStart && isBeforeEnd;
  };

  const filteredCompanyCounts: Record<string, number> = {};

  Object.entries(summary?.dailyCounts || {}).forEach(([date, companies]) => {
    if (!isWithinDateRange(date)) return;
  
    Object.entries(companies).forEach(([company, count]) => {
      if (companyFilter !== "All" && company !== companyFilter) return;
      filteredCompanyCounts[company] = (filteredCompanyCounts[company] || 0) + count;
    });
  });

  

    const filteredDates = Object.entries(summary?.dailyCounts || {})
    .filter(([date]) => isWithinDateRange(date))
    .map(([date, companyData]) => {
      const count =
        companyFilter === "All"
          ? Object.values(companyData).reduce((sum: number, c: number) => sum + c, 0)
          : companyData[companyFilter] || 0;
  
      return { date, count };
    });
  

  const barData = {
    labels: Object.keys(filteredCompanyCounts),
    datasets: [
      {
        label: "Records per Company",
        data: Object.values(filteredCompanyCounts),
        backgroundColor: "#3B82F6",
        borderRadius: 6,
      },
    ],
  };

  const lineData = {
    labels: filteredDates.map((d) => d.date),
    datasets: [
      {
        label: `Daily Records - ${companyFilter}`,
        data: filteredDates.map((d) => d.count),
        borderColor: "#2563EB",
        backgroundColor: "rgba(59, 130, 246, 0.15)",
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointBackgroundColor: "#2563EB",
        pointBorderColor: "#fff",
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          font: { family: "'Inter', sans-serif" },
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.8)",
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        cornerRadius: 6,
      },
    },
    scales: {
      x: {
        ticks: { font: { size: 12 } },
        grid: { color: "transparent" },
      },
      y: {
        beginAtZero: true,
        ticks: { font: { size: 12 } },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
    },
  };

  if (loading) {
    return (
      <Layout>
        <div className="h-80 flex items-center justify-center">
          <div className="loader" />
        </div>
      </Layout>
    );
  }

  if (error || !summary) {
    return (
      <Layout>
        <div className="p-6 text-center text-error">{error || "Something went wrong."}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <button
          onClick={() => navigate(`/tasks/${id}`)}
          className="flex items-center text-[var(--task-blue)] hover:underline"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Task
        </button>

        <div className="card">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <BarChart2 className="mr-2 text-[var(--task-blue)]" />
                Task {id} Analytics
              </h1>
              <p className="text-muted">
                Breakdown from {" "}
                <span className="font-semibold">{taskMeta?.startDate || "beginning"}</span> to {" "}
                <span className="font-semibold">{taskMeta?.endDate || "end"}</span>
              </p>
            </div>

            <a
              href={`http://localhost:5001/api/tasks/${id}/records/download`}
              className="btn-outline flex items-center"
              download
            >
              <Download size={18} className="mr-2" />
              Export CSV
            </a>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[var(--task-muted)] rounded-md p-4">
              <div className="text-sm text-muted">Total Records</div>
              <div className="text-2xl font-bold mt-1">{summary.totalRecords}</div>
            </div>
            <div className="bg-[var(--task-muted)] rounded-md p-4">
              <div className="text-sm text-muted">Companies</div>
              <div className="text-2xl font-bold mt-1">{allCompanies.length}</div>
            </div>
            <div className="bg-[var(--task-muted)] rounded-md p-4">
              <div className="text-sm text-muted">Total Price</div>
              <div className="text-2xl font-bold mt-1">
                ${Number(summary.totalPrice).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Filter size={18} className="text-muted" />
              <label className="text-sm font-medium">Company:</label>
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="select"
              >
                <option value="All">All Companies</option>
                {allCompanies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="select"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="select"
                />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg border border-[var(--task-border)] shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Records by Company</h3>
              <div className="h-80">
                <Bar data={barData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-[var(--task-border)] shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Daily Records Trend</h3>
              <div className="h-80">
                <Line data={lineData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TaskChartsPage;