// getGlobal.ts
export async function getGlobal() {
    const res = await fetch("http://localhost:1337/api/global?populate=*");
    const json = await res.json();
    return json.data;
}
