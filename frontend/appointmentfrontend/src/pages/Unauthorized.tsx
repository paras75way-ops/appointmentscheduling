import { Link, useNavigate } from "react-router";

export default function Unauthorized() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="text-center space-y-4 max-w-md">
                <div className="text-7xl font-black text-gray-200 dark:text-gray-700 select-none">
                    403
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Access Denied
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    You don&apos;t have permission to view this page. Contact your
                    administrator if you believe this is a mistake.
                </p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                        Go Back
                    </button>
                    <Link
                        to="/dashboard"
                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
                    >
                        Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
