import { Badge, type BadgeTone } from "@/components/common";
import type { ClaseDetalle } from "@/types";
import { claseStatus, type ClaseStatus } from "@/utils/claseUtils";

const config: Record<ClaseStatus, { label: string; tone: BadgeTone }> = {
  DISPONIBLE: { label: "Disponible", tone: "neutral" },
  ULTIMOS_LUGARES: { label: "Últimos lugares", tone: "warning" },
  COMPLETA: { label: "Completa", tone: "accent" },
  EN_CURSO: { label: "En curso", tone: "warning" },
  FINALIZADA: { label: "Finalizada", tone: "success" },
  CANCELADA: { label: "Cancelada", tone: "danger" },
};

export function ClaseStatusBadge({ clase }: { clase: ClaseDetalle }) {
  const { label, tone } = config[claseStatus(clase)];
  return <Badge tone={tone}>{label}</Badge>;
}
