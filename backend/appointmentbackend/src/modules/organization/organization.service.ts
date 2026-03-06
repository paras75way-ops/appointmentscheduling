import Organization from "./organization.models";
import { OrganizationType } from "./organization.types";

export const getAllOrganizations = async (type?: OrganizationType) => {
    const filter: { type?: OrganizationType } = {};
    if (type) filter.type = type;
    return Organization.find(filter)
        .select("name type staff createdAt")
        .populate("staff", "name email")
        .sort({ name: 1 });
};

export const getOrganizationById = async (orgId: string) => {
    const org = await Organization.findById(orgId).populate("staff", "name email role");
    if (!org) throw new Error("Organization not found");
    return org;
};

export const getOrganizationByOwner = async (ownerId: string) => {
    const org = await Organization.findOne({ owner: ownerId }).populate(
        "staff",
        "name email role"
    );
    if (!org) throw new Error("Organization not found");
    return org;
};

export const updateOrganization = async (
    orgId: string,
    ownerId: string,
    data: { name?: string; type?: OrganizationType }
) => {
    const org = await Organization.findById(orgId);
    if (!org) throw new Error("Organization not found");

    if (org.owner.toString() !== ownerId) {
        throw new Error("You are not the owner of this organization");
    }

    if (data.name) org.name = data.name;
    if (data.type) org.type = data.type;

    await org.save();
    return org;
};
