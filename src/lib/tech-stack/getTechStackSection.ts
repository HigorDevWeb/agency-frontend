// getTechStackSection.ts
export async function getTechStackSection() {
    const res = await fetch("http://localhost:1337/api/tech-stack-section?populate=*");
    const json = await res.json();
    return json.data;
}
