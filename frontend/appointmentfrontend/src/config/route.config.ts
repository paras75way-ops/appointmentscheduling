import type { IUser } from "../types/auth";

export type Role = IUser["role"];

export interface FrontendRoute {
    path: string;
    roles: Role[];
    guestOnly?: boolean;
    public?: boolean;
}

export const frontendRoutes: FrontendRoute[] = [
    { path: "/signin", roles: [], guestOnly: true },
    { path: "/signup", roles: [], guestOnly: true },

    { path: "/verify-otp", roles: [], public: true },

    { path: "/dashboard", roles: ["user", "admin", "staff"] },
    { path: "/change-password", roles: ["user", "admin", "staff"] },

    { path: "/manage-organization", roles: ["admin"] },
    { path: "/manage-staff", roles: ["admin"] },
    { path: "/business-hours", roles: ["admin"] },
    { path: "/appointments/admin", roles: ["admin"] },
    { path: "/reschedule-policy", roles: ["admin"] },

    { path: "/browse-organizations", roles: ["user"] },
    { path: "/book-appointment", roles: ["user"] },
    { path: "/my-appointments", roles: ["user"] },

    { path: "/my-schedule", roles: ["staff"] },
];

export function checkAccess(
    path: string,
    user: IUser | null
): "allow" | "unauthorized" | "unauthenticated" | "redirect-dashboard" {
    const rule = frontendRoutes.find((r) => r.path === path);

    if (!rule) return "allow";

    if (rule.public) return "allow";

    if (rule.guestOnly) {
        return user ? "redirect-dashboard" : "allow";
    }

    if (!user) return "unauthenticated";

    if (rule.roles.length > 0 && !rule.roles.includes(user.role)) {
        return "unauthorized";
    }

    return "allow";
}
