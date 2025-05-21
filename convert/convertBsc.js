import { readJson, writeJson } from "@/util/convertUtil.js";

const raw = await readJson('download/bsc5.json')
console.log(`object amount: ${raw.length}`)
const result = [];
for (let i=0; i<10; i++) {
  result.push(raw[i]);
}
await writeJson("public/converted/bsc.json", result);





