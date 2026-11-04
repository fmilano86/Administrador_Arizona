import {
  Pencil,
  Plus,
  Search,
  UserRoundX,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import { useState } from "react";

import {
  Avatar,
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Input,
  Modal,
  PageHeader,
  SegmentedControl,
  Skeleton,
} from "@/components/common";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { useCambiarEstadoUsuario, useUsuarios } from "@/hooks/useUsuarios";
import { toast } from "@/store/toastStore";
import type { Rol, Usuario } from "@/types";
import { formatFechaCorta } from "@/utils/dateUtils";
import { getErrorMessage } from "@/utils/errorUtils";

import { UsuarioForm } from "./UsuarioForm";

type RolGestionable = Extract<Rol, "ALUMNO" | "PROFESOR">;

const textos = {
  ALUMNO: {
    titulo: "Alumnos",
    subtitulo: "Datos de contacto y estado de cada alumno.",
    nuevo: "Nuevo alumno",
    editar: "Editar alumno",
    crear: "Nuevo alumno",
    baja: "Dar de baja",
    alta: "Reactivar",
    inactivo: "De baja",
    confirmarBaja: "¿Dar de baja a este alumno?",
    detalleBaja:
      "No va a poder iniciar sesión ni reservar clases. Podés reactivarlo cuando quieras.",
    vacio: "Todavía no hay alumnos",
  },
  PROFESOR: {
    titulo: "Profesores",
    subtitulo: "Quiénes dictan clases y quiénes tienen acceso al sistema.",
    nuevo: "Nuevo profesor",
    editar: "Editar profesor",
    crear: "Nuevo profesor",
    baja: "Quitar acceso",
    alta: "Restablecer acceso",
    inactivo: "Sin acceso",
    confirmarBaja: "¿Quitarle el acceso a este profesor?",
    detalleBaja:
      "No va a poder iniciar sesión ni se lo va a poder asignar a nuevos horarios. Podés restablecer el acceso cuando quieras.",
    vacio: "Todavía no hay profesores",
  },
} satisfies Record<RolGestionable, Record<string, string>>;

// Listado, alta, edición y baja de alumnos o profesores.
export function UsuariosManager({ rol }: { rol: RolGestionable }) {
  const t = textos[rol];
  const { data, isLoading, isError, error, refetch } = useUsuarios(rol);
  const cambiarEstado = useCambiarEstadoUsuario();

  const [vista, setVista] = useState<"activos" | "todos">("activos");
  const [busqueda, setBusqueda] = useState("");
  const [formulario, setFormulario] = useState<{ usuario?: Usuario } | null>(
    null,
  );
  const [aCambiar, setACambiar] = useState<Usuario | null>(null);
  const [errorEstado, setErrorEstado] = useState<string | null>(null);

  const texto = busqueda.trim().toLowerCase();
  const filas = (data ?? [])
    .filter((u) => vista === "todos" || !u.eliminado_en)
    .filter(
      (u) =>
        !texto ||
        `${u.nombre} ${u.apellido} ${u.email} ${u.dni ?? ""}`
          .toLowerCase()
          .includes(texto),
    );

  const cerrarEstado = () => {
    setACambiar(null);
    setErrorEstado(null);
  };

  const confirmarEstado = async () => {
    if (!aCambiar) return;
    const reactivar = !!aCambiar.eliminado_en;
    try {
      await cambiarEstado.mutateAsync({ id: aCambiar.id, activo: reactivar });
      toast.success(
        reactivar ? "Reactivado" : t.inactivo,
        `${aCambiar.nombre} ${aCambiar.apellido}`,
      );
      cerrarEstado();
    } catch (e) {
      setErrorEstado(getErrorMessage(e, "No pudimos actualizar el estado."));
    }
  };

  const columnas: Column<Usuario>[] = [
    {
      key: "nombre",
      header: rol === "ALUMNO" ? "Alumno" : "Profesor",
      cell: (u) => (
        <div className="flex items-center gap-3">
          <Avatar nombre={u.nombre} apellido={u.apellido} size="sm" />
          <div>
            <p className="leading-tight font-medium">
              {u.nombre} {u.apellido}
            </p>
            <p className="text-xs text-oliva-600">{u.email}</p>
          </div>
        </div>
      ),
    },
    { key: "telefono", header: "Teléfono", cell: (u) => u.telefono ?? "—" },
    {
      key: "dni",
      header: "DNI",
      hideOnMobile: true,
      cell: (u) => u.dni ?? "—",
    },
    {
      key: "nacimiento",
      header: "Nacimiento",
      hideOnMobile: true,
      cell: (u) =>
        u.fecha_nacimiento ? formatFechaCorta(u.fecha_nacimiento) : "—",
    },
    {
      key: "estado",
      header: "Estado",
      cell: (u) =>
        u.eliminado_en ? (
          <Badge tone="danger">{t.inactivo}</Badge>
        ) : (
          <Badge tone="success" dot>
            Activo
          </Badge>
        ),
    },
    {
      key: "acciones",
      header: <span className="sr-only">Acciones</span>,
      className: "text-right",
      cell: (u) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFormulario({ usuario: u })}
            leftIcon={<Pencil className="size-4" />}
          >
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setACambiar(u)}
            leftIcon={
              u.eliminado_en ? (
                <UserRoundCheck className="size-4" />
              ) : (
                <UserRoundX className="size-4" />
              )
            }
          >
            {u.eliminado_en ? t.alta : t.baja}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.titulo}
        subtitle={t.subtitulo}
        actions={
          <Button
            onClick={() => setFormulario({})}
            leftIcon={<Plus className="size-4" />}
          >
            {t.nuevo}
          </Button>
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full max-w-sm">
          <Input
            label={`Buscar ${rol === "ALUMNO" ? "alumno" : "profesor"}`}
            type="search"
            placeholder="Nombre, correo o DNI"
            leftIcon={<Search />}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <SegmentedControl
          label="Estado"
          value={vista}
          onChange={setVista}
          options={[
            { value: "activos", label: "Activos" },
            { value: "todos", label: "Todos" },
          ]}
        />
      </div>

      {isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <DataTable
          caption={t.titulo}
          columns={columnas}
          rows={filas}
          getRowKey={(u) => u.id}
          rowClassName={(u) => (u.eliminado_en ? "opacity-70" : undefined)}
          empty={
            <EmptyState
              icon={<UsersRound />}
              title={texto ? "No encontramos resultados" : t.vacio}
              description={
                texto
                  ? "Revisá la búsqueda e intentá de nuevo."
                  : `Usá “${t.nuevo}” para sumar el primero.`
              }
            />
          }
        />
      )}

      <Modal
        open={!!formulario}
        onClose={() => setFormulario(null)}
        title={formulario?.usuario ? t.editar : t.crear}
      >
        <UsuarioForm
          rol={rol}
          usuario={formulario?.usuario}
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
          aCambiar?.eliminado_en ? `¿${t.alta.toLowerCase()}?` : t.confirmarBaja
        }
        description={
          aCambiar ? `${aCambiar.nombre} ${aCambiar.apellido}` : undefined
        }
        confirmLabel={aCambiar?.eliminado_en ? t.alta : t.baja}
        cancelLabel="Volver"
      >
        {!aCambiar?.eliminado_en && (
          <p className="text-sm text-oliva-700">{t.detalleBaja}</p>
        )}
      </ConfirmDialog>
    </div>
  );
}
