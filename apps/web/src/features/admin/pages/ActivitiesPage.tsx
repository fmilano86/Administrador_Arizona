import { useState } from "react";
import { Pencil, Plus, RotateCcw, Sparkles } from "lucide-react";

import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Modal,
  PageHeader,
  Skeleton,
} from "../../../components/common";
import {
  useActividades,
  useCambiarEstadoActividad,
} from "../../../hooks/useActividades";
import { toast } from "../../../store/toastStore";
import type { Actividad } from "@/types";
import { getErrorMessage } from "@/utils/errorUtils";

import { ActivityForm } from "../components/ActivityForm";

export default function ActivitiesPage() {
  const { data, isLoading, isError, error, refetch } = useActividades();
  const cambiarEstado = useCambiarEstadoActividad();
  const [formulario, setFormulario] = useState<{
    actividad?: Actividad;
  } | null>(null);
  const [aCambiar, setACambiar] = useState<Actividad | null>(null);
  const [errorEstado, setErrorEstado] = useState<string | null>(null);

  const cerrarEstado = () => {
    setACambiar(null);
    setErrorEstado(null);
  };

  const confirmarEstado = async () => {
    if (!aCambiar) return;
    const reactivar = !!aCambiar.eliminado_en;
    try {
      await cambiarEstado.mutateAsync({ id: aCambiar.id, activa: reactivar });
      toast.success(
        reactivar ? "Actividad reactivada" : "Actividad dada de baja",
        aCambiar.nombre,
      );
      cerrarEstado();
    } catch (e) {
      setErrorEstado(getErrorMessage(e, "No pudimos actualizar la actividad."));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Actividades"
        subtitle="Las disciplinas que ofrece el estudio."
        actions={
          <Button
            onClick={() => setFormulario({})}
            leftIcon={<Plus className="size-4" />}
          >
            Nueva actividad
          </Button>
        }
      />

      {isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      ) : (data ?? []).length === 0 ? (
        <Card>
          <EmptyState
            icon={<Sparkles />}
            title="Todavía no hay actividades"
            description="Creá la primera para poder armar los horarios."
            action={
              <Button onClick={() => setFormulario({})}>Nueva actividad</Button>
            }
          />
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(data ?? []).map((a) => (
            <li key={a.id}>
              <Card
                className={`flex h-full flex-col gap-4 p-6 ${a.eliminado_en ? "opacity-70" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-h3 font-semibold">{a.nombre}</h2>
                  {a.eliminado_en ? (
                    <Badge tone="danger">De baja</Badge>
                  ) : (
                    <Badge tone="success" dot>
                      Activa
                    </Badge>
                  )}
                </div>
                <p className="flex-1 text-sm text-oliva-700">
                  {a.descripcion || "Sin descripción."}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setFormulario({ actividad: a })}
                    leftIcon={<Pencil className="size-4" />}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setACambiar(a)}
                    leftIcon={
                      a.eliminado_en ? (
                        <RotateCcw className="size-4" />
                      ) : undefined
                    }
                  >
                    {a.eliminado_en ? "Reactivar" : "Dar de baja"}
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={!!formulario}
        onClose={() => setFormulario(null)}
        title={formulario?.actividad ? "Editar actividad" : "Nueva actividad"}
      >
        <ActivityForm
          actividad={formulario?.actividad}
          onClose={() => setFormulario(null)}
        />
      </Modal>

      <ConfirmDialog
        open={!!aCambiar}
        onClose={cerrarEstado}
        onConfirm={confirmarEstado}
        loading={cambiarEstado.isPending}
        error={errorEstado}
        tone={aCambiar?.eliminado_en ? "primary" : "danger"}
        title={
          aCambiar?.eliminado_en
            ? "¿Reactivar esta actividad?"
            : "¿Dar de baja esta actividad?"
        }
        description={aCambiar?.nombre}
        confirmLabel={aCambiar?.eliminado_en ? "Reactivar" : "Dar de baja"}
      >
        {!aCambiar?.eliminado_en && (
          <p className="text-sm text-oliva-700">
            Ya no se va a poder elegir al crear nuevos horarios. Las clases que
            ya existen no cambian.
          </p>
        )}
      </ConfirmDialog>
    </div>
  );
}
