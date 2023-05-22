export default function toUniqueArray(arr, primary_key) {
    const myMap = arr.reduce((acc, cur) => ({
        ...acc,
        [cur[primary_key]]: 0,
    }), {});


    return arr.filter(item => {
        if (myMap[item[primary_key]] > 0) return false;
        myMap[item[primary_key]]++;
        return true;
    });
}