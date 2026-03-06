import { Types } from "mongoose";

export interface IOrganization {
  name: string;
  type: "clinic" | "salon" | "service_provider" | "coworking_space";
  owner: Types.ObjectId;
  staff: Types.ObjectId[];
}

export type OrganizationType = IOrganization["type"];
