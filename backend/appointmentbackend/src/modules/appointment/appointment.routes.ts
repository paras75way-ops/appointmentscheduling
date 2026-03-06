import express from "express";
import {
    getOrganizationStaff,
    getAvailableSlots,
    bookAppointment,
    cancelAppointment,
    rescheduleAppointment,
    getMyAppointments,
    getMyStaffAppointments,
    getOrganizationAppointments,
    getReschedulePolicyHandler,
    upsertReschedulePolicyHandler,
} from "./appointment.controller";

const router = express.Router();

router.get("/admin/reschedule-policy", getReschedulePolicyHandler);
router.put("/admin/reschedule-policy", upsertReschedulePolicyHandler);
router.get("/admin/all", getOrganizationAppointments);

router.get("/org/:organizationId/staff", getOrganizationStaff);
router.get("/slots/:organizationId/:staffId", getAvailableSlots);
router.post("/book", bookAppointment);
router.patch("/:id/cancel", cancelAppointment);
router.patch("/:id/reschedule", rescheduleAppointment);
router.get("/my", getMyAppointments);
router.get("/staff/schedule", getMyStaffAppointments);

export default router;
