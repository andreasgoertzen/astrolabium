import axios from "axios";
import { logJson } from "@/util/convertUtil.js";
import { XMLParser } from "fast-xml-parser";

const search = encodeURIComponent('altair');
const result = await axios(`http://cds.unistra.fr/cgi-bin/nph-sesame/-ox/NV?${search}`);

const parser = new XMLParser({removeNSPrefix: true});
const p = parser.parse(result.data);
logJson(p);
const info = p.Sesame.Target.Resolver ? {
  name: p.Sesame.Target.name,
  ra: p.Sesame.Target.Resolver.jradeg,
  dec: p.Sesame.Target.Resolver.jdedeg,
  oname: p.Sesame.Target.Resolver.oname
} : null;
logJson(info);
