export default function niceLister (array) {
    if (!array.length) return '';
    if (array.length === 1) return array[0];

    let cloneOfArray = structuredClone(array);

    let LastInList = cloneOfArray.pop();

    return cloneOfArray.join(', ') + ' and ' + LastInList;
}