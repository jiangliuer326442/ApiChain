export function sub(set1 : Set<String>, set2 : Set<String>) : Set<String> {
    let difference = new Set([...set1].filter(x => !set2.has(x)));
    return difference;
}

export function union(set1 : Set<String>, set2 : Set<String>, set3 : Set<String>) : Set<String> {
    let unionSet = new Set([...set1, ...set2, ...set3]);
    return unionSet;
}

export function intersect(set1 : Set<String>, set2 : Set<String>) {
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    return intersection;
}

export function objectToMap(obj) {
    const map = new Map();
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) { // 确保只处理对象自身的属性
            map.set(key, obj[key]);
        }
    }
    return map;
}