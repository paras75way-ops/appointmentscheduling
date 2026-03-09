import express from "express";
import authRoutes from "./modules/auth/auth.routes";
import organizationRoutes from "./modules/organization/organization.routes";
import staffRoutes from "./modules/staff/staff.routes";
import businessHoursRoutes from "./modules/businessHours/businessHours.routes";
import appointmentRoutes from "./modules/appointment/appointment.routes";
import serviceRoutes from "./modules/services/services.routes";
import cookieParser from "cookie-parser";
import cors from "cors";
import { rbac } from "./middleware/rbac.middleware";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.use("/api", rbac);

app.use("/api/auth", authRoutes);
app.use("/api/organization", organizationRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/business-hours", businessHoursRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/services", serviceRoutes);
export default app;