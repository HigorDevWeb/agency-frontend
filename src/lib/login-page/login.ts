// getTechStackSection.ts
export async function getLoginPage() {
    const res = await fetch("http://localhost:1337/api/login-modal-content?populate=*");
    const json = await res.json();
    return json.data;
}
