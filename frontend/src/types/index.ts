export interface Task {
    id: number;
    name: string;
    status: "pending" | "in_progress" | "completed";
    createdAt: string;
    data?: CarSale[];
  }
  
  export interface CarSale {
    id: number;
    company: string;
    model: string;
    price: number;
    date: string;
    color: string;
    source: string;
  }
  