import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/configuracion")({
  component: Settings,
});

function Settings() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Configuración</h2>
      <p className="text-gray-600">
        Configuración del sistema próximamente...
      </p>
    </div>
  );
}
