// getTechStackSection.ts
export async function getTechStackSection() {
    const res = await fetch("https://api.recruitings.info/api/tech-stack-section?populate=*");
    const json = await res.json();
    return json.data;
}
