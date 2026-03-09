import { useState } from "react";
import {
    useListOrganizationsQuery,
    useGetOrganizationByIdQuery,
    useGetAvailableSlotsQuery,
    useBookAppointmentMutation,
    useSearchServicesQuery,
    useGetServicesByOrganizationQuery,
    useGetStaffForServiceQuery,
} from "../store/api/authApi";
import type { IOrganization, IStaffMember, IUtcSlot, IService } from "../types/auth";
import { utcIsoToLocalTime } from "../utils/timezone";

type OrgType = "clinic" | "salon" | "service_provider" | "coworking_space" | "";

const ORG_TYPE_OPTIONS: { label: string; value: OrgType }[] = [
    { label: "All Types", value: "" },
    { label: "Clinic", value: "clinic" },
    { label: "Salon", value: "salon" },
    { label: "Service Provider", value: "service_provider" },
    { label: "Coworking Space", value: "coworking_space" },
];

const ORG_TYPE_BADGES: Record<string, string> = {
    clinic: "bg-blue-100 text-blue-700",
    salon: "bg-pink-100 text-pink-700",
    service_provider: "bg-orange-100 text-orange-700",
    coworking_space: "bg-green-100 text-green-700",
};

type Step = "orgs" | "services" | "staff" | "slots" | "confirm";

export default function BrowseOrganizations() {
    const [typeFilter, setTypeFilter] = useState<OrgType>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [step, setStep] = useState<Step>("orgs");

    const [selectedOrg, setSelectedOrg] = useState<IOrganization | null>(null);
    const [selectedService, setSelectedService] = useState<IService | null>(null);
    const [selectedStaff, setSelectedStaff] = useState<IStaffMember | null>(null);
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [selectedSlot, setSelectedSlot] = useState<IUtcSlot | null>(null);
    const [notes, setNotes] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

    const { data: orgs, isLoading: orgsLoading } = useListOrganizationsQuery(
        typeFilter || undefined
    );


    const { data: searchResults, isFetching: searchLoading } = useSearchServicesQuery(
        debouncedQuery,
        { skip: !debouncedQuery || debouncedQuery.length < 2 }
    );


    const { data: orgServices, isFetching: orgServicesLoading } = useGetServicesByOrganizationQuery(
        selectedOrg?._id ?? "",
        { skip: !selectedOrg || step !== "services" }
    );


    const { data: serviceStaff, isFetching: serviceStaffLoading } = useGetStaffForServiceQuery(
        {
            serviceId: selectedService?._id ?? "",
            organizationId: selectedOrg?._id ?? "",
        },
        { skip: !selectedService || !selectedOrg || step !== "staff" }
    );

    const { data: orgDetail, isFetching: orgDetailLoading } =
        useGetOrganizationByIdQuery(selectedOrg?._id ?? "", {
            skip: !selectedOrg || step !== "staff",
        });

    const { data: slotsData, isFetching: slotsLoading } =
        useGetAvailableSlotsQuery(
            {
                organizationId: selectedOrg?._id ?? "",
                staffId: selectedStaff?._id ?? "",
                date: selectedDate,
                serviceId: selectedService?._id,
            },
            { skip: !selectedOrg || !selectedStaff || !selectedDate || step !== "slots" }
        );

    const [book, { isLoading: isBooking }] = useBookAppointmentMutation();

    const today = new Date().toISOString().split("T")[0];

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        if (searchTimer) clearTimeout(searchTimer);
        const timer = setTimeout(() => {
            setDebouncedQuery(value.trim());
        }, 400);
        setSearchTimer(timer);
    };

    const handleSelectOrg = (org: IOrganization) => {
        setSelectedOrg(org);
        setSelectedService(null);
        setSelectedStaff(null);
        setSelectedSlot(null);
        setStep("services");
    };

    const handleSelectService = (service: IService) => {
        setSelectedService(service);
        setSelectedStaff(null);
        setSelectedSlot(null);
        setStep("staff");
    };

    const handleSelectStaff = (staff: IStaffMember) => {
        setSelectedStaff(staff);
        setSelectedSlot(null);
        setStep("slots");
    };

    const handleSelectSlot = (slot: IUtcSlot) => {
        setSelectedSlot(slot);
        setStep("confirm");
    };

    const handleBook = async () => {
        if (!selectedOrg || !selectedStaff || !selectedSlot || !selectedService) return;
        try {
            setErrorMsg("");
            await book({
                organizationId: selectedOrg._id,
                staffId: selectedStaff._id,
                serviceId: selectedService._id,
                startTimeUtc: selectedSlot.startTimeUtc,
                notes,
            }).unwrap();
            setSuccessMsg(
                `Booked! ${selectedService.name} with ${selectedStaff.name} — ${utcIsoToLocalTime(selectedSlot.startTimeUtc)}–${utcIsoToLocalTime(selectedSlot.endTimeUtc)} on ${selectedDate}.`
            );
            setStep("orgs");
            setSelectedOrg(null);
            setSelectedService(null);
            setSelectedStaff(null);
            setSelectedSlot(null);
            setNotes("");
        } catch (err: unknown) {
            const e = err as { data?: { message?: string } };
            setErrorMsg(e.data?.message ?? "Booking failed");
        }
    };


    const searchResultsByOrg = searchResults?.reduce<Record<string, { orgName: string; orgType: string; orgId: string; services: IService[] }>>((acc, svc) => {
        const orgObj = svc.organizationId as { _id: string; name: string; type: string };
        if (!orgObj?._id) return acc;
        if (!acc[orgObj._id]) {
            acc[orgObj._id] = { orgName: orgObj.name, orgType: orgObj.type, orgId: orgObj._id, services: [] };
        }
        acc[orgObj._id].services.push(svc);
        return acc;
    }, {}) ?? {};

    const Breadcrumb = () => (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6 flex-wrap">
            {[
                { label: "Organizations", targetStep: "orgs" as Step },
                ...(selectedOrg ? [{ label: selectedOrg.name, targetStep: "services" as Step }] : []),
                ...(selectedService ? [{ label: selectedService.name, targetStep: "staff" as Step }] : []),
                ...(selectedStaff ? [{ label: selectedStaff.name, targetStep: "slots" as Step }] : []),
                ...(step === "confirm" ? [{ label: "Confirm", targetStep: "confirm" as Step }] : []),
            ].map((crumb, i, arr) => (
                <span key={crumb.label} className="flex items-center gap-2">
                    {i > 0 && <span>/</span>}
                    <button
                        onClick={() => {
                            if (crumb.targetStep !== step) {
                                setStep(crumb.targetStep);
                                if (crumb.targetStep === "orgs") { setSelectedOrg(null); setSelectedService(null); setSelectedStaff(null); setSelectedSlot(null); }
                                if (crumb.targetStep === "services") { setSelectedService(null); setSelectedStaff(null); setSelectedSlot(null); }
                                if (crumb.targetStep === "staff") { setSelectedStaff(null); setSelectedSlot(null); }
                                if (crumb.targetStep === "slots") setSelectedSlot(null);
                            }
                        }}
                        className={`hover:text-indigo-600 transition ${i === arr.length - 1
                            ? "text-indigo-600 dark:text-indigo-400 font-medium"
                            : "hover:underline"
                            }`}
                    >
                        {crumb.label}
                    </button>
                </span>
            ))}
        </div>
    );


    if (step === "orgs") {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Browse Organizations
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Find a service provider and book an appointment.
                    </p>
                </div>

                {successMsg && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 text-green-700 dark:text-green-400 text-sm">
                        ✓ {successMsg}
                    </div>
                )}


                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search services (e.g. haircut, shave, consultation)..."
                        className="w-full p-3 pl-10 rounded-xl border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                    <svg className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>


                {debouncedQuery.length >= 2 && (
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Search results for "{debouncedQuery}"
                        </p>
                        {searchLoading ? (
                            <div className="grid gap-3">
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : Object.keys(searchResultsByOrg).length === 0 ? (
                            <p className="text-sm text-gray-500 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                                No services found matching "{debouncedQuery}".
                            </p>
                        ) : (
                            <div className="grid gap-3">
                                {Object.entries(searchResultsByOrg).map(([orgId, group]) => (
                                    <div
                                        key={orgId}
                                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">{group.orgName}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${ORG_TYPE_BADGES[group.orgType] ?? "bg-gray-100 text-gray-600"}`}>
                                                {group.orgType.replace(/_/g, " ")}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {group.services.map((svc) => (
                                                <button
                                                    key={svc._id}
                                                    onClick={() => {
                                                        const orgObj = svc.organizationId as { _id: string; name: string; type: string };
                                                        setSelectedOrg({ _id: orgObj._id, name: orgObj.name, type: orgObj.type, owner: "", staff: [] } as IOrganization);
                                                        handleSelectService(svc);
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg text-sm border border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition"
                                                >
                                                    {svc.name} — ₹{svc.price} · {svc.duration}min
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}


                {(!debouncedQuery || debouncedQuery.length < 2) && (
                    <>
                        <div className="flex gap-2 flex-wrap">
                            {ORG_TYPE_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setTypeFilter(opt.value)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition border ${typeFilter === opt.value
                                        ? "bg-indigo-600 text-white border-indigo-600"
                                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-indigo-400"
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {orgsLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : !orgs?.length ? (
                            <div className="text-center text-gray-500 py-12">No organizations found.</div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {orgs.map((org) => (
                                    <button
                                        key={org._id}
                                        onClick={() => handleSelectOrg(org)}
                                        className="group text-left bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:border-indigo-400 hover:shadow-md transition"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 transition">
                                                {org.name}
                                            </h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${ORG_TYPE_BADGES[org.type] ?? "bg-gray-100 text-gray-600"}`}>
                                                {org.type.replace(/_/g, " ")}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {Array.isArray(org.staff) ? org.staff.length : 0} staff member
                                            {(Array.isArray(org.staff) ? org.staff.length : 0) !== 1 ? "s" : ""}
                                        </p>
                                        <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2 group-hover:underline">
                                            View services →
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    }


    if (step === "services") {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Select a Service
                </h1>
                <Breadcrumb />

                {orgServicesLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : !orgServices?.length ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        No services available at this organization.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {orgServices.filter(s => s.isActive).map((svc) => (
                            <button
                                key={svc._id}
                                onClick={() => handleSelectService(svc)}
                                className="group text-left bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:border-indigo-400 hover:shadow-md transition"
                            >
                                <div className="flex items-start justify-between mb-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 transition">
                                        {svc.name}
                                    </h3>
                                    {svc.category && (
                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                                            {svc.category}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{svc.description}</p>
                                <div className="flex gap-3 text-sm text-gray-600 dark:text-gray-300">
                                    <span className="font-medium">₹{svc.price}</span>
                                    <span>{svc.duration} min</span>
                                </div>
                                <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2 group-hover:underline">
                                    Select this service →
                                </p>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }


    if (step === "staff") {
        const staffList = serviceStaff ?? [];
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Select a Staff Member
                </h1>
                <Breadcrumb />

                {serviceStaffLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : !staffList.length ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        No staff available for this service.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {staffList.map((staff) => (
                            <button
                                key={staff._id}
                                onClick={() => handleSelectStaff(staff)}
                                className="group text-left bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:border-indigo-400 hover:shadow-md transition"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-lg">
                                        {staff.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 transition">
                                            {staff.name}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{staff.email}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-3 group-hover:underline">
                                    View available slots →
                                </p>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }


    if (step === "slots") {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Choose a Time Slot
                </h1>
                <Breadcrumb />

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4 shadow-sm">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Select Date
                        </label>
                        <input
                            type="date"
                            min={today}
                            value={selectedDate}
                            onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(null); }}
                            className="p-2.5 rounded-lg border dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                    </div>

                    {slotsLoading ? (
                        <div className="grid grid-cols-3 gap-2 pt-2">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : !slotsData?.slots?.length ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                            No available slots for {selectedDate}. Try another day.
                        </p>
                    ) : (
                        <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Available slots — displayed in your local time
                            </p>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {slotsData.slots.map((slot) => (
                                    <button
                                        key={slot.startTimeUtc}
                                        onClick={() => handleSelectSlot(slot)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${selectedSlot?.startTimeUtc === slot.startTimeUtc
                                            ? "bg-indigo-600 text-white border-indigo-600"
                                            : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-indigo-400"
                                            }`}
                                    >
                                        {utcIsoToLocalTime(slot.startTimeUtc)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }


    return (
        <div className="max-w-xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Confirm Booking
            </h1>
            <Breadcrumb />

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-4">
                <div className="space-y-2">
                    {[
                        { label: "Organization", value: selectedOrg?.name },
                        { label: "Service", value: selectedService ? `${selectedService.name} (₹${selectedService.price} · ${selectedService.duration}min)` : "" },
                        { label: "Staff", value: selectedStaff?.name },
                        { label: "Date", value: selectedDate },
                        {
                            label: "Time (your timezone)",
                            value: selectedSlot
                                ? `${utcIsoToLocalTime(selectedSlot.startTimeUtc)} – ${utcIsoToLocalTime(selectedSlot.endTimeUtc)}`
                                : "",
                        },
                    ].map((row) => (
                        <div key={row.label} className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">{row.label}</span>
                            <span className="font-medium text-gray-900 dark:text-white">{row.value}</span>
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notes (optional)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        placeholder="Anything you'd like to add..."
                        className="w-full p-2.5 rounded-lg border dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-sm"
                    />
                </div>

                {errorMsg && <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>}

                <div className="flex gap-3">
                    <button
                        onClick={() => setStep("slots")}
                        className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm font-medium"
                    >
                        ← Back
                    </button>
                    <button
                        onClick={handleBook}
                        disabled={isBooking}
                        className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 text-sm font-medium"
                    >
                        {isBooking ? "Booking..." : "Confirm Booking"}
                    </button>
                </div>
            </div>
        </div>
    );
}
