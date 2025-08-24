// getGlobal.ts
export async function getGlobal() {
    const res = await fetch("https://api.recruitings.info/api/global?populate=*");
    const json = await res.json();
    return json.data;
}
