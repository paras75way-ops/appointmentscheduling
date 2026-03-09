export type Role = "user" | "admin" | "staff";

export interface RoutePermission {
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    path: string;
    roles: Role[];
    public?: boolean;
}

export const routePermissions: RoutePermission[] = [
    { method: "POST", path: "/auth/register", roles: [], public: true },
    { method: "POST", path: "/auth/login", roles: [], public: true },
    { method: "POST", path: "/auth/refresh", roles: [], public: true },
    { method: "POST", path: "/auth/logout", roles: [], public: true },
    { method: "POST", path: "/auth/verify-otp", roles: [], public: true },
    { method: "POST", path: "/auth/resend-otp", roles: [], public: true },

    { method: "GET", path: "/auth/me", roles: ["user", "admin", "staff"] },
    { method: "POST", path: "/auth/change-password", roles: ["user", "admin", "staff"] },

    { method: "GET", path: "/organization", roles: ["user", "admin", "staff"] },
    { method: "GET", path: "/organization/mine", roles: ["admin"] },
    { method: "GET", path: "/organization/:id", roles: ["user", "admin", "staff"] },
    { method: "PUT", path: "/organization/:id", roles: ["admin"] },

    { method: "POST", path: "/staff", roles: ["admin"] },
    { method: "GET", path: "/staff", roles: ["admin"] },
    { method: "DELETE", path: "/staff/:id", roles: ["admin"] },

    { method: "POST", path: "/business-hours", roles: ["admin"] },
    { method: "PUT", path: "/business-hours/:organizationId", roles: ["admin"] },
    { method: "GET", path: "/business-hours/:organizationId", roles: ["user", "admin", "staff"] },

    { method: "GET", path: "/appointments/org/:organizationId/staff", roles: ["user", "admin", "staff"] },
    { method: "GET", path: "/appointments/slots/:organizationId/:staffId", roles: ["user", "admin", "staff"] },

    { method: "POST", path: "/appointments/book", roles: ["user"] },
    { method: "PATCH", path: "/appointments/:id/cancel", roles: ["user", "admin", "staff"] },
    { method: "GET", path: "/appointments/my", roles: ["user"] },
    { method: "PATCH", path: "/appointments/:id/reschedule", roles: ["user"] },

    { method: "GET", path: "/appointments/staff/schedule", roles: ["staff"] },

    { method: "GET", path: "/appointments/admin/all", roles: ["admin"] },
    { method: "GET", path: "/appointments/admin/reschedule-policy", roles: ["admin"] },
    { method: "PUT", path: "/appointments/admin/reschedule-policy", roles: ["admin"] },

    { method: "POST", path: "/services/createservice", roles: ["admin"] },
    { method: "GET", path: "/services/getservice", roles: ["user", "admin", "staff"] },
    { method: "GET", path: "/services/getservicebyid/:id", roles: ["user", "admin", "staff"] },
    { method: "GET", path: "/services/getservices/organization/:organizationId", roles: ["user", "admin", "staff"] },
    { method: "PUT", path: "/services/updateservice/:id", roles: ["admin"] },
    { method: "DELETE", path: "/services/deleteservice/:id", roles: ["admin"] },
    { method: "GET", path: "/services/search", roles: ["user", "admin", "staff"] },
    { method: "GET", path: "/services/:serviceId/staff", roles: ["user", "admin", "staff"] },

    { method: "POST", path: "/staff/:staffId/services/:serviceId", roles: ["admin"] },
    { method: "DELETE", path: "/staff/:staffId/services/:serviceId", roles: ["admin"] },
];
