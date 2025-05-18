import { readJson, writeJson } from "./convertUtil.js";

const raw = await readJson('download/iau/IAU-CSN.json')
console.log(`object amount: ${raw.length}`)
const mappedData = raw.map(x => ({
  name: x['Name/Diacritics'],
  desig: x.Designation,
  id: x.ID,
  hip: x.HIP,
  hd: x.HD,
  con: x.Con,
  mag: x.mag,
  ra: x['RA(J2000)'],
  dec: x['Dec(J2000)']
}));
await writeJson("public/converted/iau-csn.json", mappedData);





