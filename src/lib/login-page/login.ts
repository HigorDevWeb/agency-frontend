// getTechStackSection.ts
export async function getLoginPage() {
    const res = await fetch("https://api.recruitings.info/api/login-modal-content?populate=*");
    const json = await res.json();
    return json.data;
}
