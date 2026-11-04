import { useMemo, useState } from "react";
import { CalendarClock, Plus } from "lucide-react";

import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Modal,
  PageHeader,
  SegmentedControl,
  Skeleton,
} from "@/components/common";
import { ClaseStatusBadge } from "@/components/ui/ClaseStatusBadge";
import { CupoIndicator } from "@/components/ui/CupoIndicator";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { useActividades } from "@/hooks/useActividades";
import { useCancelarBloque, useBloques } from "@/hooks/useBloques";
import { useCancelarClase, useClases } from "@/hooks/useClases";
import { useUsuarios } from "@/hooks/useUsuarios";
import { toast } from "@/store/toastStore";
import type { BloqueClase, ClaseDetalle } from "@/types";
import { nombreCompleto } from "@/utils/claseUtils";
import {
  addDays,
  capitalize,
  formatDiaMes,
  formatFechaCorta,
  nombreDiaSemana,
  rangoHorario,
  startOfDay,
  toApiDate,
  yaComenzo,
} from "@/utils/dateUtils";
import { getErrorMessage } from "@/utils/errorUtils";

import { BloqueForm } from "../components/BloqueForm";

type Vista = "bloques" | "clases";
type Pendiente =
  | { tipo: "bloque"; bloque: BloqueClase }
  | { tipo: "clase"; clase: ClaseDetalle };

// Gestión de horarios: bloques recurrentes y clases generadas.
export default function HorariosPage() {
  const [vista, setVista] = useState<Vista>("bloques");
  const [crearAbierto, setCrearAbierto] = useState(false);
  const [pendiente, setPendiente] = useState<Pendiente | null>(null);
  const [errorCancelar, setErrorCancelar] = useState<string | null>(null);

  const hoy = useMemo(() => startOfDay(new Date()), []);
  const bloques = useBloques();
  const actividades = useActividades();
  const profesores = useUsuarios("PROFESOR");
  const clases = useClases({
    desde: toApiDate(hoy),
    hasta: toApiDate(addDays(hoy, 30)),
  });
  const cancelarBloque = useCancelarBloque();
  const cancelarClase = useCancelarClase();

  const nombreActividad = (id: number) =>
    actividades.data?.find((a) => a.id === id)?.nombre ?? "—";
  const nombreProfesor = (id: number) => {
    const p = profesores.data?.find((u) => u.id === id);
    return p ? nombreCompleto(p) : "—";
  };

  const cerrarPendiente = () => {
    setPendiente(null);
    setErrorCancelar(null);
  };

  const confirmarCancelacion = async () => {
    if (!pendiente) return;
    try {
      if (pendiente.tipo === "bloque") {
        await cancelarBloque.mutateAsync(pendiente.bloque.id);
        toast.success(
          "Bloque cancelado",
          "Se cancelaron sus clases futuras y las reservas asociadas.",
        );
      } else {
        await cancelarClase.mutateAsync(pendiente.clase.id);
        toast.success(
          "Clase cancelada",
          "Se cancelaron las reservas confirmadas.",
        );
      }
      cerrarPendiente();
    } catch (e) {
      setErrorCancelar(getErrorMessage(e, "No pudimos cancelar."));
    }
  };

  const columnasBloques: Column<BloqueClase>[] = [
    {
      key: "actividad",
      header: "Actividad",
      className: "font-medium",
      cell: (b) => nombreActividad(b.actividad_id),
    },
    {
      key: "profesor",
      header: "Profesor/a",
      cell: (b) => nombreProfesor(b.profesor_id),
    },
    {
      key: "horario",
      header: "Día y horario",
      cell: (b) =>
        `${capitalize(nombreDiaSemana(b.fecha_desde))} · ${b.hora_inicio} – ${b.hora_fin}`,
    },
    {
      key: "vigencia",
      header: "Vigencia",
      hideOnMobile: true,
      cell: (b) =>
        `${formatFechaCorta(b.fecha_desde)} – ${formatFechaCorta(b.fecha_hasta)}`,
    },
    {
      key: "cupo",
      header: "Cupo",
      className: "tabular-nums",
      cell: (b) => b.cupo_maximo,
    },
    {
      key: "estado",
      header: "Estado",
      cell: (b) =>
        b.estado === "ACTIVO" ? (
          <Badge tone="success" dot>
            Activo
          </Badge>
        ) : (
          <Badge tone="danger">Cancelado</Badge>
        ),
    },
    {
      key: "acciones",
      header: <span className="sr-only">Acciones</span>,
      className: "text-right",
      cell: (b) =>
        b.estado === "ACTIVO" && b.fecha_hasta >= toApiDate(hoy) ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPendiente({ tipo: "bloque", bloque: b })}
          >
            Cancelar bloque
          </Button>
        ) : null,
    },
  ];

  const columnasClases: Column<ClaseDetalle>[] = [
    {
      key: "fecha",
      header: "Fecha",
      className: "whitespace-nowrap font-medium",
      cell: (c) => capitalize(formatDiaMes(c.inicio)),
    },
    {
      key: "horario",
      header: "Horario",
      className: "tabular-nums",
      cell: (c) => rangoHorario(c.inicio, c.fin),
    },
    { key: "actividad", header: "Actividad", cell: (c) => c.actividad.nombre },
    {
      key: "profesor",
      header: "Profesor/a",
      hideOnMobile: true,
      cell: (c) => nombreCompleto(c.profesor),
    },
    {
      key: "lugares",
      header: "Lugares",
      cell: (c) => (
        <CupoIndicator ocupados={c.turnos_confirmados} total={c.cupo_maximo} />
      ),
    },
    {
      key: "estado",
      header: "Estado",
      cell: (c) => <ClaseStatusBadge clase={c} />,
    },
    {
      key: "acciones",
      header: <span className="sr-only">Acciones</span>,
      className: "text-right",
      cell: (c) =>
        c.estado === "PROGRAMADA" && !yaComenzo(c.inicio) ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPendiente({ tipo: "clase", clase: c })}
          >
            Cancelar clase
          </Button>
        ) : null,
    },
  ];

  const bloquesOrdenados = [...(bloques.data ?? [])].sort((a, b) =>
    b.fecha_desde.localeCompare(a.fecha_desde),
  );
  const cargando = vista === "bloques" ? bloques.isLoading : clases.isLoading;
  const fallo = vista === "bloques" ? bloques : clases;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Horarios"
        subtitle="Armá los bloques de clases y revisá las próximas."
        actions={
          <Button
            onClick={() => setCrearAbierto(true)}
            leftIcon={<Plus className="size-4" />}
          >
            Nuevo horario
          </Button>
        }
      />

      <SegmentedControl
        label="Vista de horarios"
        value={vista}
        onChange={setVista}
        options={[
          { value: "bloques", label: "Bloques" },
          { value: "clases", label: "Próximas clases" },
        ]}
      />

      {fallo.isError ? (
        <ErrorState error={fallo.error} onRetry={fallo.refetch} />
      ) : cargando ? (
        <Skeleton className="h-72" />
      ) : vista === "bloques" ? (
        <DataTable
          caption="Bloques de clases"
          columns={columnasBloques}
          rows={bloquesOrdenados}
          getRowKey={(b) => b.id}
          rowClassName={(b) =>
            b.estado === "CANCELADO" ? "opacity-60" : undefined
          }
          empty={
            <EmptyState
              icon={<CalendarClock />}
              title="Todavía no hay horarios"
              description="Creá un bloque para generar las clases de varias semanas de una vez."
              action={
                <Button onClick={() => setCrearAbierto(true)}>
                  Nuevo horario
                </Button>
              }
            />
          }
        />
      ) : (
        <DataTable
          caption="Clases de los próximos 30 días"
          columns={columnasClases}
          rows={(clases.data ?? []).filter(
            (c) => !yaComenzo(c.inicio) || c.estado === "CANCELADA",
          )}
          getRowKey={(c) => c.id}
          rowClassName={(c) =>
            c.estado === "CANCELADA" ? "opacity-60" : undefined
          }
          empty={
            <EmptyState
              icon={<CalendarClock />}
              title="No hay clases en los próximos 30 días"
            />
          }
        />
      )}

      <Modal
        open={crearAbierto}
        onClose={() => setCrearAbierto(false)}
        title="Nuevo horario"
        size="lg"
        description="Se crea una clase por semana, el mismo día y horario."
      >
        <BloqueForm onClose={() => setCrearAbierto(false)} />
      </Modal>

      <ConfirmDialog
        open={!!pendiente}
        onClose={cerrarPendiente}
        onConfirm={confirmarCancelacion}
        loading={cancelarBloque.isPending || cancelarClase.isPending}
        error={errorCancelar}
        tone="danger"
        title={
          pendiente?.tipo === "bloque"
            ? "¿Cancelar este bloque?"
            : "¿Cancelar esta clase?"
        }
        description={
          pendiente?.tipo === "bloque"
            ? `${nombreActividad(pendiente.bloque.actividad_id)} · ${nombreProfesor(pendiente.bloque.profesor_id)}`
            : pendiente
              ? `${pendiente.clase.actividad.nombre} · ${formatDiaMes(pendiente.clase.inicio)}, ${rangoHorario(pendiente.clase.inicio, pendiente.clase.fin)}`
              : undefined
        }
        confirmLabel={
          pendiente?.tipo === "bloque" ? "Cancelar bloque" : "Cancelar clase"
        }
        cancelLabel="Volver"
      >
        <p className="text-sm text-oliva-700">
          {pendiente?.tipo === "bloque"
            ? "Se cancelan todas las clases futuras del bloque y las reservas confirmadas en ellas."
            : pendiente?.tipo === "clase" &&
                pendiente.clase.turnos_confirmados > 0
              ? `Se van a cancelar ${pendiente.clase.turnos_confirmados} ${pendiente.clase.turnos_confirmados === 1 ? "reserva confirmada" : "reservas confirmadas"}.`
              : "Esta clase no tiene reservas confirmadas."}
        </p>
      </ConfirmDialog>
    </div>
  );
}
