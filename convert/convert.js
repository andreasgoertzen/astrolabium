import { readFile, writeFile } from "fs/promises";

const starsRaw = await readJson('public/data/stars.6.json');
const starNames = await readJson('public/data/starnames.json');
const stars = [];
starsRaw.features.forEach(x => {
  const star = {
    hip: x.id,
    mag: x.properties.mag,
  }
  const starName = starNames[x.id];
  if (starName && starName.de) {
    star.name = starName.de;
    stars.push(star);
    console.log(star.name)
  }
})

// console.log(starsRaw.features[0]);
// console.log(stars.length)

// const response = await axios.get('http://vizier.u-strasbg.fr/viz-bin/asu-tsv?-source=I/239/hip_main');
// await writeFile('download/x.tsv', response.data, 'utf-8');


// await writeJson("public/converted/schna.json", {bla: 7});


