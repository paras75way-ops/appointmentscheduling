import { useRouteLoaderData, Navigate, useLocation } from "react-router";
import { checkAccess } from "../config/route.config";
import type { IUser } from "../types/auth";

interface RoleGuardProps {
    children: React.ReactNode;
}

export default function RoleGuard({ children }: RoleGuardProps) {
    const user = useRouteLoaderData("private-layout") as IUser | null;
    const { pathname } = useLocation();

    const decision = checkAccess(pathname, user);

    if (decision === "allow") return <>{children}</>;
    if (decision === "redirect-dashboard") return <Navigate to="/dashboard" replace />;
    if (decision === "unauthenticated") return <Navigate to="/signin" replace />;
    return <Navigate to="/unauthorized" replace />;
}
