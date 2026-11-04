import { useMemo, useState } from "react";
import { Search, UsersRound } from "lucide-react";

import {
  Avatar,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Skeleton,
} from "@/components/common";
import { DataTable, type Column } from "@/components/ui/DataTable";
import type { UsuarioResumen } from "@/types";
import {
  addDays,
  formatDiaMes,
  formatHora,
  parseISO,
  startOfDay,
  toApiDate,
} from "@/utils/dateUtils";

import { useProfesorClasses } from "../hooks/useProfesorClasses";

interface FilaAlumno {
  alumno: UsuarioResumen;
  clases: number;
  proxima: string | null;
}

const HOY = startOfDay(new Date());

// Alumnos que pasaron o van a pasar por las clases del profesor (±30 días).
export default function StudentListPage() {
  const [busqueda, setBusqueda] = useState("");
  const { turnos, isLoading, isError, error, refetch } = useProfesorClasses({
    desde: toApiDate(addDays(HOY, -30)),
    hasta: toApiDate(addDays(HOY, 30)),
  });

  const filas = useMemo(() => {
    const mapa = new Map<number, FilaAlumno>();
    const ahora = new Date();
    for (const t of turnos) {
      const fila = mapa.get(t.alumno_id) ?? {
        alumno: t.alumno,
        clases: 0,
        proxima: null,
      };
      fila.clases += 1;
      const inicio = parseISO(t.clase.inicio);
      if (inicio > ahora && (!fila.proxima || inicio < parseISO(fila.proxima)))
        fila.proxima = t.clase.inicio;
      mapa.set(t.alumno_id, fila);
    }
    return [...mapa.values()].sort((a, b) =>
      a.alumno.apellido.localeCompare(b.alumno.apellido, "es"),
    );
  }, [turnos]);

  const texto = busqueda.trim().toLowerCase();
  const visibles = texto
    ? filas.filter((f) =>
        `${f.alumno.nombre} ${f.alumno.apellido} ${f.alumno.email ?? ""}`
          .toLowerCase()
          .includes(texto),
      )
    : filas;

  const columnas: Column<FilaAlumno>[] = [
    {
      key: "alumno",
      header: "Alumno",
      cell: ({ alumno }) => (
        <div className="flex items-center gap-3">
          <Avatar nombre={alumno.nombre} apellido={alumno.apellido} size="sm" />
          <span className="font-medium">
            {alumno.nombre} {alumno.apellido}
          </span>
        </div>
      ),
    },
    {
      key: "telefono",
      header: "Teléfono",
      cell: ({ alumno }) => alumno.telefono ?? "—",
    },
    {
      key: "email",
      header: "Correo",
      hideOnMobile: true,
      cell: ({ alumno }) => alumno.email ?? "—",
    },
    {
      key: "cumple",
      header: "Cumpleaños",
      hideOnMobile: true,
      cell: ({ alumno }) =>
        alumno.fecha_nacimiento ? formatDiaMes(alumno.fecha_nacimiento) : "—",
    },
    {
      key: "clases",
      header: "Clases",
      className: "tabular-nums",
      cell: (f) => f.clases,
    },
    {
      key: "proxima",
      header: "Próxima clase",
      cell: (f) =>
        f.proxima
          ? `${formatDiaMes(f.proxima)}, ${formatHora(f.proxima)}`
          : "—",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alumnos"
        subtitle="Quienes reservaron tus clases en los últimos y próximos 30 días."
      />

      <div className="max-w-sm">
        <Input
          label="Buscar alumno"
          type="search"
          placeholder="Nombre o correo"
          leftIcon={<Search />}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <DataTable
          caption="Alumnos inscriptos en tus clases"
          columns={columnas}
          rows={visibles}
          getRowKey={(f) => f.alumno.id}
          empty={
            <EmptyState
              icon={<UsersRound />}
              title={
                texto
                  ? "No encontramos a nadie con ese nombre"
                  : "Todavía no hay alumnos inscriptos"
              }
              description={
                texto
                  ? "Revisá la búsqueda e intentá de nuevo."
                  : "Cuando reserven tus clases, van a aparecer acá."
              }
            />
          }
        />
      )}
    </div>
  );
}
