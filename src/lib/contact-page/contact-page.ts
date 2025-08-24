// getContactPage.ts
export async function getContactPage() {
    const res = await fetch("https://api.recruitings.info/api/contact-page?populate=*");
    const json = await res.json();
    return json.data;
}
