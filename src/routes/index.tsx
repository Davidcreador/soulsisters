import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "../components/Dashboard";
import { ProtectedRoute } from "../components/ProtectedRoute";

export const Route = createFileRoute("/")({
  component: () => (
    <ProtectedRoute allowedRoles={["admin"]}>
      <Dashboard />
    </ProtectedRoute>
  ),
});
