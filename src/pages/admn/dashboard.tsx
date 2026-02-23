import { useEffect } from "react";
import { useRouter } from "next/router";

export default function AdmnDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to correct admin dashboard URL
    router.replace("/admin/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-gray-400">Redirecting to admin dashboard...</p>
      </div>
    </div>
  );
}