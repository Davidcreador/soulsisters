import { createFileRoute } from "@tanstack/react-router";
import { Inventory } from "../../components/Inventory";

export const Route = createFileRoute("/inventario/")({
  component: Inventory,
});
