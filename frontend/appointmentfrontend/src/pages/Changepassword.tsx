import { useForm } from "react-hook-form";
import { useState } from "react";

interface FormData {
  currentPassword: string;
  newPassword: string;
}

export default function ChangePassword() {
  const { register, handleSubmit, reset } = useForm<FormData>();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const accessToken = localStorage.getItem("accessToken");

      const res = await fetch(
        "http://localhost:5000/api/auth/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(data),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      setMessage(result.message);
      reset();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800">

        <h2 className="text-2xl font-semibold text-white text-center mb-6">
          Change Password
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Current Password */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Current Password
            </label>
            <input
              type="password"
              {...register("currentPassword", { required: true })}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="Enter current password"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              New Password
            </label>
            <input
              type="password"
              {...register("newPassword", { required: true, minLength: 6 })}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="Enter new password"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
        </form>

        {/* Success Message */}
        {message && (
          <p className="mt-4 text-sm text-green-400 text-center">
            {message}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p className="mt-4 text-sm text-red-400 text-center">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}