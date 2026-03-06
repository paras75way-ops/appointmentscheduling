import { Link } from "react-router";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col justify-center items-center p-4">
            <div className="max-w-4xl w-full text-center space-y-8">
                <div className="space-y-4">
                    <h1 className="text-5xl sm:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        Book Appointments <br className="hidden sm:block" />
                        <span className="text-indigo-600 dark:text-indigo-400">With Ease</span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        The simplest way to schedule, manage, and book appointments with your favorite service providers, clinics, and professionals.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                    <Link
                        to="/signup"
                        className="px-8 py-3.5 text-lg font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition w-full sm:w-auto shadow-md"
                    >
                        Get Started
                    </Link>
                    <Link
                        to="/signin"
                        className="px-8 py-3.5 text-lg font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition w-full sm:w-auto shadow-sm"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
