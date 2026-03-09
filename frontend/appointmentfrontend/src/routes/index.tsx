import { createBrowserRouter } from "react-router";

import PublicLayout from "../layouts/Publiclayout";
import PrivateLayout from "../layouts/Privatelayout";
import RoleGuard from "../components/RoleGuard";

import SignIn from "../pages/Signin";
import SignUp from "../pages/Signup";
import VerifyEmail from "../pages/VerifyEmail";
import Unauthorized from "../pages/Unauthorized";

import Dashboard from "../pages/Dashboard";
import ChangePassword from "../pages/Changepassword";

import ManageOrganization from "../pages/ManageOrganization";
import ManageStaff from "../pages/ManageStaff";
import ManageServices from "../pages/ManageServices";
import BusinessHoursConfig from "../pages/BusinessHoursConfig";
import AdminAppointments from "../pages/AdminAppointments";
import ReschedulePolicy from "../pages/ReschedulePolicy";

import BrowseOrganizations from "../pages/BrowseOrganizations";
import BookAppointment from "../pages/BookAppointment";
import MyAppointments from "../pages/MyAppointments";

import StaffSchedule from "../pages/StaffSchedule";
import LandingPage from "../pages/LandingPage";

import { requireGuest, userLoader } from "./loader";
import { signInAction } from "./actions/signin.action";
import { LoadingFallback } from "../components/loadingfallback";

export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/verify-otp", element: <VerifyEmail /> },
  { path: "/unauthorized", element: <Unauthorized /> },

  {
    element: <PublicLayout />,
    loader: requireGuest,
    HydrateFallback: LoadingFallback,
    children: [
      { path: "/signin", element: <SignIn />, action: signInAction },
      { path: "/signup", element: <SignUp /> },
    ],
  },

  {
    id: "private-layout",
    element: <PrivateLayout />,
    loader: userLoader,
    HydrateFallback: LoadingFallback,
    children: [
      { path: "/dashboard", element: <RoleGuard><Dashboard /></RoleGuard> },
      { path: "/change-password", element: <RoleGuard><ChangePassword /></RoleGuard> },

      { path: "/manage-organization", element: <RoleGuard><ManageOrganization /></RoleGuard> },
      { path: "/manage-staff", element: <RoleGuard><ManageStaff /></RoleGuard> },
      { path: "/manage-services", element: <RoleGuard><ManageServices /></RoleGuard> },
      { path: "/business-hours", element: <RoleGuard><BusinessHoursConfig /></RoleGuard> },
      { path: "/appointments/admin", element: <RoleGuard><AdminAppointments /></RoleGuard> },
      { path: "/reschedule-policy", element: <RoleGuard><ReschedulePolicy /></RoleGuard> },

      { path: "/browse-organizations", element: <RoleGuard><BrowseOrganizations /></RoleGuard> },
      { path: "/book-appointment", element: <RoleGuard><BookAppointment /></RoleGuard> },
      { path: "/my-appointments", element: <RoleGuard><MyAppointments /></RoleGuard> },

      { path: "/my-schedule", element: <RoleGuard><StaffSchedule /></RoleGuard> },
    ],
  },
]);