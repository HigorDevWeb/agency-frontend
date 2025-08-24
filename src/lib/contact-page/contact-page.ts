// getContactPage.ts
export async function getContactPage() {
    const res = await fetch("http://localhost:1337/api/contact-page?populate=*");
    const json = await res.json();
    return json.data;
}
