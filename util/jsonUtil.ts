const fs = require("fs")
export function writeMapFile(myMap:Map<any,any>){
    fs.writeFileSync(`${__dirname}/../config/data.json`,mapToJson(myMap));
}
export function readMapFile<K>(){
    return jsonToMap(fs.readFileSync(`${__dirname}/../config/data.json`).toString()) as Map<string,K>
}
function strMapToObj<K,V>(strMap: Map<K,V>): object {
    let obj = Object.create(null);
    // @ts-ignore
    for (let [k, v] of strMap) {
        obj[k] = v;
    }
    return obj;
}
/**
 *map转换为json
 */
function mapToJson(map: Map<any,any>) {
    return JSON.stringify(strMapToObj(map));
}
function objToStrMap(obj: any) {
    let strMap = new Map();
    for (let k of Object.keys(obj)) {
        strMap.set(k, obj[k]);
    }
    return strMap;
}
/**
 *json转换为map
 */
function jsonToMap(jsonStr:string) {
    return objToStrMap(JSON.parse(jsonStr));
}
