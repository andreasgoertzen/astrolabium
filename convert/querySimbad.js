import axios from "axios";

// const q = `SELECT  top 20 * FROM basic`;
// const q = encodeURIComponent(`select top 20 * from ident where id = 'M1'`);

// alltypes
// const q = encodeURIComponent(`select top 100 oidref, otypes from alltypes`);


// otypes
// const q = encodeURIComponent(`select top 100 oidref,otype,origin from otypes`);


// ident
// const q = encodeURIComponent(`select top 2 id,oidref from ident where id = 'M1'`);

// basic
// [ [ 'M   1', 'SNR', 83.6324, 22.0174, 795871 ] ]
const q = encodeURIComponent(`select top 1 main_id, otype, ra, dec, oid from basic where oid = 795871`);



try {
  const x = await axios.get(`http://simbad.cds.unistra.fr/simbad/sim-tap/sync?REQUEST=doQuery&LANG=ADQL&FORMAT=JSON&QUERY=${q}`);
  console.log(x.data.data);
} catch (e) {
  console.log(e);
}
