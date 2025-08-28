"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type Banner = { type: "success" | "error" | "info"; text: string };

function ConfirmBannerContent() {
    const search = useSearchParams();
    const router = useRouter();
    const [banner, setBanner] = useState<Banner | null>(null);

    const confirmed = search.get("confirmed");
    const error = search.get("error");

    const message = useMemo<Banner | null>(() => {
        if (confirmed === "true") {
            return {
                type: "success",
                text: "Conta confirmada com sucesso! Agora você já pode fazer login.",
            };
        }
        if (error) {
            return {
                type: "error",
                text:
                    "Não foi possível confirmar seu e-mail. Solicite um novo link e tente novamente.",
            };
        }
        return null;
    }, [confirmed, error]);

    useEffect(() => {
        setBanner(message);
    }, [message]);

    if (!banner) return null;

    const bg =
        banner.type === "success"
            ? "bg-emerald-600/15 border-emerald-500 text-emerald-300"
            : banner.type === "error"
                ? "bg-red-600/15 border-red-500 text-red-300"
                : "bg-slate-600/15 border-slate-500 text-slate-300";

    return (
        <div className={`mb-4 rounded-lg border px-4 py-3 ${bg}`}>
            <div className="flex items-start justify-between gap-4">
                <p className="text-sm">{banner.text}</p>
                <button
                    aria-label="Fechar aviso"
                    className="opacity-70 hover:opacity-100 transition"
                    onClick={() => {
                        setBanner(null);
                        const url = new URL(window.location.href);
                        url.searchParams.delete("confirmed");
                        url.searchParams.delete("error");
                        router.replace(url.pathname);
                    }}
                >
                    ✕
                </button>
            </div>
        </div>
    );
}

export default function ConfirmBanner() {
    return (
        <Suspense fallback={<div className="mb-4 h-12"></div>}>
            <ConfirmBannerContent />
        </Suspense>
    );
}
