import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseApi";
import type {
  IUser,
  IOrganization,
  IStaffMember,
  IAddStaffForm,
  IBusinessHours,
  IDaySchedule,
  IUtcSlot,
  IAppointment,
  IBookAppointmentForm,
  IReschedulePolicy,
  IRescheduleAppointmentForm,
  IService,
  ICreateServiceForm,
  IUpdateServiceForm,
} from "../../types/auth";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Organization", "Staff", "BusinessHours", "Appointments", "ReschedulePolicy", "Services"],
  endpoints: (builder) => ({

    getMe: builder.query<IUser, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),

    getMyOrganization: builder.query<IOrganization, void>({
      query: () => "/organization/mine",
      providesTags: ["Organization"],
    }),

    listOrganizations: builder.query<IOrganization[], string | void>({
      query: (type) =>
        type ? `/organization?type=${type}` : "/organization",
      providesTags: ["Organization"],
    }),

    getOrganizationById: builder.query<IOrganization, string>({
      query: (id) => `/organization/${id}`,
      providesTags: ["Organization"],
    }),

    updateOrganization: builder.mutation<
      IOrganization,
      { id: string; data: Partial<IOrganization> }
    >({
      query: ({ id, data }) => ({
        url: `/organization/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Organization"],
    }),

    getStaff: builder.query<IStaffMember[], void>({
      query: () => "/staff",
      providesTags: ["Staff"],
    }),

    addStaff: builder.mutation<{ message: string; staff: IStaffMember }, IAddStaffForm>({
      query: (body) => ({ url: "/staff", method: "POST", body }),
      invalidatesTags: ["Staff"],
    }),

    removeStaff: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/staff/${id}`, method: "DELETE" }),
      invalidatesTags: ["Staff"],
    }),

    assignServiceToStaff: builder.mutation<
      { message: string },
      { staffId: string; serviceId: string }
    >({
      query: ({ staffId, serviceId }) => ({
        url: `/staff/${staffId}/services/${serviceId}`,
        method: "POST",
      }),
      invalidatesTags: ["Staff"],
    }),

    removeServiceFromStaff: builder.mutation<
      { message: string },
      { staffId: string; serviceId: string }
    >({
      query: ({ staffId, serviceId }) => ({
        url: `/staff/${staffId}/services/${serviceId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Staff"],
    }),

    getBusinessHours: builder.query<IBusinessHours, string>({
      query: (organizationId) => `/business-hours/${organizationId}`,
      providesTags: ["BusinessHours"],
    }),

    upsertBusinessHours: builder.mutation<
      IBusinessHours,
      { slotDuration: number; schedule: IDaySchedule[]; organizationId?: string }
    >({
      query: (body) => ({ url: "/business-hours", method: "POST", body }),
      invalidatesTags: ["BusinessHours"],
    }),

    getOrganizationStaff: builder.query<IStaffMember[], string>({
      query: (organizationId) => `/appointments/org/${organizationId}/staff`,
    }),

    getAvailableSlots: builder.query<
      { date: string; slots: IUtcSlot[] },
      { organizationId: string; staffId: string; date: string; serviceId?: string }
    >({
      query: ({ organizationId, staffId, date, serviceId }) => {
        let url = `/appointments/slots/${organizationId}/${staffId}?date=${date}`;
        if (serviceId) url += `&serviceId=${serviceId}`;
        return url;
      },
      providesTags: ["Appointments"],
    }),

    bookAppointment: builder.mutation<IAppointment, IBookAppointmentForm>({
      query: (body) => ({ url: "/appointments/book", method: "POST", body }),
      invalidatesTags: ["Appointments"],
    }),

    cancelAppointment: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/appointments/${id}/cancel`, method: "PATCH" }),
      invalidatesTags: ["Appointments"],
    }),

    getMyAppointments: builder.query<IAppointment[], boolean | void>({
      query: (history) =>
        history ? "/appointments/my?history=true" : "/appointments/my",
      providesTags: ["Appointments"],
    }),

    getStaffSchedule: builder.query<IAppointment[], string | undefined>({
      query: (date) =>
        date
          ? `/appointments/staff/schedule?date=${date}`
          : "/appointments/staff/schedule",
      providesTags: ["Appointments"],
    }),

    getAdminAppointments: builder.query<IAppointment[], string | undefined>({
      query: (date) =>
        date
          ? `/appointments/admin/all?date=${date}`
          : "/appointments/admin/all",
      providesTags: ["Appointments"],
    }),

    rescheduleAppointment: builder.mutation<
      IAppointment,
      { id: string } & IRescheduleAppointmentForm
    >({
      query: ({ id, ...body }) => ({
        url: `/appointments/${id}/reschedule`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Appointments"],
    }),

    getReschedulePolicy: builder.query<IReschedulePolicy, void>({
      query: () => "/appointments/admin/reschedule-policy",
      providesTags: ["ReschedulePolicy"],
    }),

    upsertReschedulePolicy: builder.mutation<IReschedulePolicy, Partial<IReschedulePolicy>>({
      query: (body) => ({ url: "/appointments/admin/reschedule-policy", method: "PUT", body }),
      invalidatesTags: ["ReschedulePolicy"],
    }),




    getServicesByOrganization: builder.query<IService[], string>({
      query: (organizationId) => `/services/getservices/organization/${organizationId}`,
      transformResponse: (response: ApiResponse<IService[]>) => response.data,
      providesTags: ["Services"],
    }),

    getServiceById: builder.query<IService, string>({
      query: (id) => `/services/getservicebyid/${id}`,
      transformResponse: (response: ApiResponse<IService>) => response.data,
      providesTags: ["Services"],
    }),

    searchServices: builder.query<IService[], string>({
      query: (q) => `/services/search?q=${encodeURIComponent(q)}`,
      transformResponse: (response: ApiResponse<IService[]>) => response.data,
      providesTags: ["Services"],
    }),

    getStaffForService: builder.query<
      IStaffMember[],
      { serviceId: string; organizationId: string }
    >({
      query: ({ serviceId }) => `/services/${serviceId}/staff`,
      transformResponse: (response: ApiResponse<IStaffMember[]>) => response.data,
    }),

    createService: builder.mutation<IService, ICreateServiceForm>({
      query: (body) => ({ url: "/services/createservice", method: "POST", body }),
      invalidatesTags: ["Services"],
    }),

    updateService: builder.mutation<IService, { id: string; data: IUpdateServiceForm }>({
      query: ({ id, data }) => ({
        url: `/services/updateservice/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Services"],
    }),

    deleteService: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/services/deleteservice/${id}`, method: "DELETE" }),
      invalidatesTags: ["Services"],
    }),
  }),
});

export const {
  useGetMeQuery,
  useGetMyOrganizationQuery,
  useListOrganizationsQuery,
  useGetOrganizationByIdQuery,
  useUpdateOrganizationMutation,
  useGetStaffQuery,
  useAddStaffMutation,
  useRemoveStaffMutation,
  useAssignServiceToStaffMutation,
  useRemoveServiceFromStaffMutation,
  useGetBusinessHoursQuery,
  useUpsertBusinessHoursMutation,
  useGetOrganizationStaffQuery,
  useGetAvailableSlotsQuery,
  useBookAppointmentMutation,
  useCancelAppointmentMutation,
  useRescheduleAppointmentMutation,
  useGetMyAppointmentsQuery,
  useGetStaffScheduleQuery,
  useGetAdminAppointmentsQuery,
  useGetReschedulePolicyQuery,
  useUpsertReschedulePolicyMutation,
  useGetServicesByOrganizationQuery,
  useGetServiceByIdQuery,
  useSearchServicesQuery,
  useGetStaffForServiceQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} = authApi;