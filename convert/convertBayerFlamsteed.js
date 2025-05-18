import axios from "axios";
import { writeJson } from "./convertUtil.js";

const q = `SELECT top 10 * FROM "IV/27A/catalog"`;

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
  await writeJson("../download/iv_27a_catalog_bayer_flamsteed.json", mappedData);
  // console.log(mappedData);

} catch (e) {
  console.log(e);
}




