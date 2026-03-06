import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { routePermissions, Role } from "../config/route.config";

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: Role;
        organizationId?: string;
        iat?: number;
        exp?: number;
    };
}

function pathToRegex(pattern: string): RegExp {
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
    const regexStr = escaped.replace(/:([^/]+)/g, "[^/]+");
    return new RegExp(`^${regexStr}$`);
}

export function rbac(req: AuthRequest, res: Response, next: NextFunction) {
    const reqPath = req.path;
    const reqMethod = req.method as RoutePermission["method"];

    const match = routePermissions.find(
        (rule) =>
            rule.method === reqMethod && pathToRegex(rule.path).test(reqPath)
    );

    if (!match) {
        return res.status(403).json({
            message: "Route not declared in RBAC config — access denied",
        });
    }

    if (match.public) {
        return next();
    }

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized — token required" });
    }

    let decoded: AuthRequest["user"];
    try {
        decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET as string
        ) as AuthRequest["user"];
    } catch {
        return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.user = decoded;

    if (match.roles.length > 0 && !match.roles.includes(decoded!.role)) {
        return res.status(403).json({
            message: `Forbidden — requires one of: [${match.roles.join(", ")}]`,
        });
    }

    next();
}

import type { RoutePermission } from "../config/route.config";
