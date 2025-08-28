export async function resendConfirmation(apiUrl: string, email: string) {
    const res = await fetch(`${apiUrl}/api/auth/send-email-confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        cache: "no-store",
    });

    if (!res.ok) {
        const t = await res.text();
        throw new Error(
            `Falha ao reenviar confirmação (${res.status}): ${t || "erro desconhecido"}`
        );
    }
    return true;
}
