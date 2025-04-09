const API_URL = "http://localhost:5001/api/tasks";

export interface CarSale {
  id: string;
  company: string;
  model: string;
  price: number;
  date: string;
  color: string;
  source: string;
}

export interface Task {
  id: string;
  name: string;
  status: 'pending' | 'inProgress' | 'completed';
  createdAt: string;
  completedAt?: string;
  startDate?: string;
  endDate?: string;
  companies?: string[];
  data?: CarSale[];
}

export const DataService = {
  createTask: async (taskData: {
    name: string;
    filters: {
      startDate?: string;
      endDate?: string;
      companies?: string[];
      sources: {
        jsonSource: boolean;
        csvSource: boolean;
      };
    };
  }): Promise<{ id: string; status: string }> => {
    const res = await fetch(`${API_URL}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });

    if (!res.ok) throw new Error("Failed to create task");
    return await res.json();
  },

  getTasks: async (): Promise<Task[]> => {
    const res = await fetch(`${API_URL}/`);
    if (!res.ok) throw new Error("Failed to fetch tasks");

    const data = await res.json();
    return data.map((t: any) => ({
      id: t.id.toString(),
      name: t.name,
      status: t.status === 'in_progress' ? 'inProgress' : t.status,
      createdAt: t.createdAt,
      completedAt: t.completedAt,
      startDate: t.startDate,
      endDate: t.endDate,
      companies: t.companies || []
    }));
  },

  getTask: async (taskId: string): Promise<Task> => {
    const res = await fetch(`${API_URL}/${taskId}`);
    if (!res.ok) throw new Error("Failed to fetch task");
    const task = await res.json();
    return {
      id: task.id.toString(),
      name: task.name,
      status: task.status === 'in_progress' ? 'inProgress' : task.status,
      createdAt: task.createdAt,
      completedAt: task.completedAt,
      startDate: task.startDate,
      endDate: task.endDate,
      companies: task.companies || []
    };
  },

  getTaskRecords: async (
    taskId: string,
    page = 1,
    source = "all",
    company = "all"
  ): Promise<{ records: CarSale[]; total: number }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "20"
    });
  
    if (source && source !== "all") {
      params.append("source", source);
    }
  
    if (company && company !== "all") {
      params.append("company", company);
    }
  
    const res = await fetch(`${API_URL}/${taskId}/records?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch task records");
    return await res.json();
  },
  
  getSummary: async (taskId: string) => {
    const res = await fetch(`${API_URL}/${taskId}/summary`);
    if (!res.ok) throw new Error("Failed to fetch summary");
    return await res.json();
  },

  getCompanies: async (): Promise<string[]> => {
    const res = await fetch(`${API_URL}/companies`);
    if (!res.ok) throw new Error("Failed to fetch companies");
    return await res.json();
  }
};
