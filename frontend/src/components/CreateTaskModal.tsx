// src/components/CreateTaskModal.tsx
import React, { useState,useEffect } from "react";
import { X, Check, AlertCircle } from "lucide-react";
import { DataService } from "../services/dataService";

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
}



export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ open, onClose, onTaskCreated }) => {
  const [taskName, setTaskName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [jsonSource, setJsonSource] = useState(true);
  const [csvSource, setCsvSource] = useState(true);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [companies, setCompanies] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
  
    fetch("http://localhost:5001/api/tasks/companies")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error("Expected company array from API");
        }
        setCompanies(data);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch companies:", err);
        setCompanies([]);
      });
  }, [open]);
  
  
  const toggleCompany = (company: string) => {
    setSelectedCompanies(prev =>
      prev.includes(company)
        ? prev.filter(c => c !== company)
        : [...prev, company]
    );
  };
  const handleSubmit = async () => {
    console.log("🧪 taskName:", taskName);
console.log("🧪 selectedCompanies:", selectedCompanies);
console.log("🧪 jsonSource:", jsonSource);
console.log("🧪 csvSource:", csvSource);

    console.log("Triggered:");
    setError("");
  
    if (!taskName) {
      setError("Please provide a task name");
      return;
    }
  
    if (!jsonSource && !csvSource) {
      setError("Please select at least one data source");
      return;
    }
  
    // ⚠️ Ensure selectedCompanies is safe
    if (!Array.isArray(selectedCompanies)) {
      setError("Company data is invalid. Please refresh and try again.");
      console.error("selectedCompanies is not an array:", selectedCompanies);
      return;
    }
  
    const filters = {
      startDate: startDate || null,
      endDate: endDate || null,
      companies: selectedCompanies,
      sources: {
        jsonSource,
        csvSource,
      },
    };
  
    console.log("✅ Filters prepared:", filters);
  
    setIsSubmitting(true);
  
    try {
      const response = await DataService.createTask({
        name: taskName,
        filters,
      });
  
      console.log("✅ Task created:", response);
      onTaskCreated();
      resetForm();
      onClose();
    } catch (err) {
      console.error("❌ API submission failed:", err);
      setError("Failed to create task. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  
  
  const resetForm = () => {
    setTaskName("");
    setStartDate("");
    setEndDate("");
    setJsonSource(true);
    setCsvSource(true);
    setSelectedCompanies([]);
    setMinPrice("");
    setMaxPrice("");
    setError("");
  };

  if (!open) return null;

  
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center animate-fade-in p-4 overflow-y-auto">
      <div className="card w-full max-w-2xl animate-slide-up relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Task</h2>
          <button onClick={onClose} className="text-[var(--task-muted)] hover:text-[var(--task-text)]">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-[var(--task-muted)] text-error flex items-center space-x-2 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Task Name</label>
            <input
              className="input"
              placeholder="e.g., Tesla Price Analysis"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                className="input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                className="input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Companies</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {companies.map((company) => (
                <button
                  key={company}
                  className={`border rounded-md px-3 py-2 text-sm ${
                    selectedCompanies.includes(company)
                      ? 'bg-[var(--task-blue)] text-white'
                      : 'bg-[var(--task-bg)] text-[var(--task-text)]'
                  }`}
                  onClick={() => toggleCompany(company)}
                  type="button"
                >
                  {company}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Min Price ($)</label>
              <input
                type="number"
                className="input"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Price ($)</label>
              <input
                type="number"
                className="input"
                placeholder="100000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          <div>
  <label className="block text-sm font-medium mb-1">Data Sources</label>
  <div className="space-y-2">
    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={jsonSource}
        onChange={() => setJsonSource(!jsonSource)}
      />
      <span>JSON Source</span>
    </label>
    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={csvSource}
        onChange={() => setCsvSource(!csvSource)}
      />
      <span>CSV Source</span>
    </label>
  </div>

</div>

        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="btn-outline">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="btn">
            {isSubmitting ? "Creating..." : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
};
