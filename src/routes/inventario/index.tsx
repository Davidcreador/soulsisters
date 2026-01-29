import { createFileRoute } from "@tanstack/react-router";
import { Inventory } from "../../components/Inventory";
import { ProtectedRoute } from "../../components/ProtectedRoute";

export const Route = createFileRoute("/inventario/")({
  component: () => (
    <ProtectedRoute allowedRoles={["admin"]}>
      <Inventory />
    </ProtectedRoute>
  ),
});
