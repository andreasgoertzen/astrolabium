import axios from "axios";
import { writeJson } from "@/util/convertUtil.js";

const q = `SELECT HIP as hip, RAJ2000 as ra, DEJ2000 as dec, "V/137D/XHIP"."Vmag" as mag, "V/137D/XHIP"."B-V" as bv, Name as name FROM "V/137D/XHIP" where "V/137D/XHIP"."Vmag" <= 8`;

try {
  const x = await axios.get(`http://tapvizier.u-strasbg.fr/TAPVizieR/tap/sync?REQUEST=doQuery&LANG=ADQL&FORMAT=JSON&QUERY=${q}`);
  const names = x.data.metadata.map(x => x.name);
  console.log(`object amount: ${x.data.data.length}`)
  const mappedData = x.data.data.map(x => {
    const obj = {};
    for(let i=0; i<x.length; i++) {
      obj[names[i]] = x[i];
    }
    return obj;
  })
  await writeJson("public/converted/xhip.json", mappedData);
  // console.log(mappedData);

} catch (e) {
  console.log(e);
}




