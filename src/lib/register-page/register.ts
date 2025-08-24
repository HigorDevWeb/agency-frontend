// getTechStackSection.ts
export async function getRegisterPage() {
    const res = await fetch("http://localhost:1337/api/register-modal-content?populate=*");
    const json = await res.json();
    return json.data;
}
