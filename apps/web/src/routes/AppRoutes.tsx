import {
  CalendarClock,
  CalendarDays,
  GraduationCap,
  House,
  LayoutDashboard,
  Sparkles,
  Ticket,
  UserRound,
  UsersRound,
} from "lucide-react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  type RouteObject,
} from "react-router";

import { AlumnoLayout, SidebarLayout, type NavItem } from "@/components/layout";
import ActivitiesPage from "@/features/admin/pages/ActivitiesPage";
import DashboardPage from "@/features/admin/pages/DashboardPage";
import HorariosPage from "@/features/admin/pages/HorariosPage";
import ProfesoresManagementPage from "@/features/admin/pages/ProfesoresManagementPage";
import StudentsManagementPage from "@/features/admin/pages/StudentsManagementPage";
import TurnosPage from "@/features/admin/pages/TurnosPage";
import ClassScheduleView from "@/features/alumno/pages/ClassScheduleView";
import AlumnoInicioPage from "@/features/alumno/pages/AlumnoInicioPage";
import MyBookingsPage from "@/features/alumno/pages/MyBookingsPage";
import LoginPage from "@/features/auth/pages/LoginPage";
import PerfilPage from "@/features/auth/pages/PerfilPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import MyClassesPage from "@/features/profesor/pages/MyClassesPage";
import ProfesorInicioPage from "@/features/profesor/pages/ProfesorInicioPage";
import StudentListPage from "@/features/profesor/pages/StudentListPage";

import { HomeRedirect } from "./HomeRedirect";
import NotFoundPage from "./NotFoundPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicOnlyRoute } from "./PublicOnlyRoute";
import { RoleGuard } from "./RoleGuard";

const navAdmin: NavItem[] = [
  { to: "/admin/inicio", label: "Inicio", icon: LayoutDashboard },
  { to: "/admin/turnos", label: "Turnos", icon: Ticket },
  { to: "/admin/horarios", label: "Horarios", icon: CalendarClock },
  { to: "/admin/actividades", label: "Actividades", icon: Sparkles },
  { to: "/admin/alumnos", label: "Alumnos", icon: UsersRound },
  { to: "/admin/profesores", label: "Profesores", icon: GraduationCap },
];

const navProfesor: NavItem[] = [
  { to: "/profesor/inicio", label: "Inicio", icon: House },
  { to: "/profesor/turnos", label: "Mis turnos", icon: CalendarDays },
  { to: "/profesor/alumnos", label: "Alumnos", icon: UsersRound },
  { to: "/profesor/perfil", label: "Perfil", icon: UserRound },
];

const rutasAlumno: RouteObject = {
  path: "/alumno",
  element: <AlumnoLayout />,
  children: [
    { index: true, element: <Navigate to="inicio" replace /> },
    { path: "inicio", element: <AlumnoInicioPage /> },
    { path: "clases", element: <ClassScheduleView /> },
    { path: "reservas", element: <MyBookingsPage /> },
    { path: "perfil", element: <PerfilPage /> },
  ],
};

const rutasProfesor: RouteObject = {
  path: "/profesor",
  element: (
    <SidebarLayout items={navProfesor} variant="light" roleLabel="Profesor" />
  ),
  children: [
    { index: true, element: <Navigate to="inicio" replace /> },
    { path: "inicio", element: <ProfesorInicioPage /> },
    { path: "turnos", element: <MyClassesPage /> },
    { path: "alumnos", element: <StudentListPage /> },
    { path: "perfil", element: <PerfilPage /> },
  ],
};

const rutasAdmin: RouteObject = {
  path: "/admin",
  element: (
    <SidebarLayout items={navAdmin} variant="dark" roleLabel="Administración" />
  ),
  children: [
    { index: true, element: <Navigate to="inicio" replace /> },
    { path: "inicio", element: <DashboardPage /> },
    { path: "turnos", element: <TurnosPage /> },
    { path: "horarios", element: <HorariosPage /> },
    { path: "actividades", element: <ActivitiesPage /> },
    { path: "alumnos", element: <StudentsManagementPage /> },
    { path: "profesores", element: <ProfesoresManagementPage /> },
  ],
};

const router = createBrowserRouter([
  { path: "/", element: <HomeRedirect /> },
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/registro", element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { element: <RoleGuard roles={["ALUMNO"]} />, children: [rutasAlumno] },
      {
        element: <RoleGuard roles={["PROFESOR"]} />,
        children: [rutasProfesor],
      },
      {
        element: <RoleGuard roles={["ADMINISTRADOR"]} />,
        children: [rutasAdmin],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}
