import { readFile, writeFile } from "fs/promises";

export const readJson = async path => JSON.parse(await readFile(path, 'utf-8'));
export const writeJson = async (path, data) => await writeFile(path, JSON.stringify(data, null, 2), 'utf-8');
export const logJson = x => console.log(JSON.stringify(x, null, 2));

export const hour2degree = (ra) =>  ra > 12 ? (ra - 24) * 15 : ra * 15;
