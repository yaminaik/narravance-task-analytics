// src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import TasksPage from "./pages/TaskPage";
import TaskDetailPage from "./pages/TaskDetailPage";
import TaskChartsPage from "./pages/TaskChartsPage";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/tasks" replace />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
      <Route path="/tasks/:id/visualization" element={<TaskChartsPage />} />
      <Route path="*" element={<div className="p-10 text-center text-lg">404 - Page Not Found</div>} />
    </Routes>
  );
};

export default App;
