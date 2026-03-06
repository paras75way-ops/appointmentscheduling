import { useRouteLoaderData } from "react-router";
import type { IUser } from "../types/auth";

export default function Dashboard() {
  const user = useRouteLoaderData("private-layout") as IUser;

  const roleLabels: Record<string, string> = {
    user: "User",
    admin: "Organization Admin",
    staff: "Staff Member",
  };

  const roleBadgeColors: Record<string, string> = {
    user: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    admin:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    staff:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome back, {user.name}!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {user.email}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
            <span
              className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${roleBadgeColors[user.role]}`}
            >
              {roleLabels[user.role]}
            </span>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
            <span className="inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Verified
            </span>
          </div>
        </div>
      </div>

      {user.role === "admin" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Admin Quick Actions
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your organization and staff from the sidebar navigation.
          </p>
        </div>
      )}

      {user.role === "staff" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Staff Dashboard
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You are logged in as a staff member. Explore your available features
            from the sidebar.
          </p>
        </div>
      )}
    </div>
  );
}