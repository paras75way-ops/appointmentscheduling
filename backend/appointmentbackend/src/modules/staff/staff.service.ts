import bcrypt from "bcryptjs";
import User from "../auth/auth.models";
import Organization from "../organization/organization.models";
import { sendOtpEmail } from "../../utils/email";

interface AddStaffData {
    name: string;
    email: string;
    password: string;
}

export const addStaff = async (adminUserId: string, data: AddStaffData) => {
    const adminUser = await User.findById(adminUserId);
    if (!adminUser || adminUser.role !== "admin") {
        throw new Error("Only admins can add staff");
    }

    if (!adminUser.organizationId) {
        throw new Error("Admin does not have an organization");
    }

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
        throw new Error("A user with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const staffUser = await User.create({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "staff",
        organizationId: adminUser.organizationId,
        isVerified: true,
    });

    await Organization.findByIdAndUpdate(adminUser.organizationId, {
        $push: { staff: staffUser._id },
    });

    return {
        message: "Staff member added successfully",
        staff: {
            id: staffUser._id,
            name: staffUser.name,
            email: staffUser.email,
            role: staffUser.role,
        },
    };
};

export const getStaffByOrganization = async (adminUserId: string) => {
    const adminUser = await User.findById(adminUserId);
    if (!adminUser || adminUser.role !== "admin") {
        throw new Error("Only admins can view staff");
    }

    if (!adminUser.organizationId) {
        throw new Error("Admin does not have an organization");
    }

    const staffMembers = await User.find({
        organizationId: adminUser.organizationId,
        role: "staff",
    }).select("name email role createdAt services").populate("services", "name");

    return staffMembers;
};

export const removeStaff = async (adminUserId: string, staffId: string) => {
    const adminUser = await User.findById(adminUserId);
    if (!adminUser || adminUser.role !== "admin") {
        throw new Error("Only admins can remove staff");
    }

    if (!adminUser.organizationId) {
        throw new Error("Admin does not have an organization");
    }

    const staffUser = await User.findById(staffId);
    if (!staffUser || staffUser.role !== "staff") {
        throw new Error("Staff member not found");
    }

    if (
        !staffUser.organizationId ||
        staffUser.organizationId.toString() !== adminUser.organizationId.toString()
    ) {
        throw new Error("Staff member does not belong to your organization");
    }

    await Organization.findByIdAndUpdate(adminUser.organizationId, {
        $pull: { staff: staffUser._id },
    });

    await User.findByIdAndDelete(staffId);

    return { message: "Staff member removed successfully" };
};

export const assignServiceToStaff = async (
    adminUserId: string,
    staffId: string,
    serviceId: string
) => {
    const adminUser = await User.findById(adminUserId);
    if (!adminUser || adminUser.role !== "admin") {
        throw new Error("Only admins can assign services");
    }
    if (!adminUser.organizationId) {
        throw new Error("Admin does not have an organization");
    }

    const staffUser = await User.findById(staffId);
    if (!staffUser || staffUser.role !== "staff") {
        throw new Error("Staff member not found");
    }
    if (
        !staffUser.organizationId ||
        staffUser.organizationId.toString() !== adminUser.organizationId.toString()
    ) {
        throw new Error("Staff member does not belong to your organization");
    }

    const { ServiceModel } = await import("../services/services.model");
    const service = await ServiceModel.findById(serviceId);
    if (!service) {
        throw new Error("Service not found");
    }
    if (service.organizationId.toString() !== adminUser.organizationId.toString()) {
        throw new Error("Service does not belong to your organization");
    }

    const alreadyAssigned = staffUser.services?.some(
        (s) => s.toString() === serviceId
    );
    if (alreadyAssigned) {
        throw new Error("Service is already assigned to this staff member");
    }

    await User.findByIdAndUpdate(staffId, {
        $push: { services: service._id },
    });

    return { message: "Service assigned to staff successfully" };
};

export const removeServiceFromStaff = async (
    adminUserId: string,
    staffId: string,
    serviceId: string
) => {
    const adminUser = await User.findById(adminUserId);
    if (!adminUser || adminUser.role !== "admin") {
        throw new Error("Only admins can remove services from staff");
    }
    if (!adminUser.organizationId) {
        throw new Error("Admin does not have an organization");
    }

    const staffUser = await User.findById(staffId);
    if (!staffUser || staffUser.role !== "staff") {
        throw new Error("Staff member not found");
    }
    if (
        !staffUser.organizationId ||
        staffUser.organizationId.toString() !== adminUser.organizationId.toString()
    ) {
        throw new Error("Staff member does not belong to your organization");
    }

    await User.findByIdAndUpdate(staffId, {
        $pull: { services: serviceId },
    });

    return { message: "Service removed from staff successfully" };
};
