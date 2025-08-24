// getTechStackSection.ts
export async function getRegisterPage() {
    const res = await fetch("https://api.recruitings.info/api/register-modal-content?populate=*");
    const json = await res.json();
    return json.data;
}
