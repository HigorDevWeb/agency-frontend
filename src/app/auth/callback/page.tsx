"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para o novo endpoint correto
    const urlParams = new URLSearchParams(window.location.search);
    const newUrl = `/connect/google/redirect?${urlParams.toString()}`;
    router.replace(newUrl);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-white mt-4">Redirecionando...</p>
      </div>
    </div>
  );
}
