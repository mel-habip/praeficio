export default function toUniqueArray(arr, primary_key) {
    const myMap = arr.reduce((acc, cur) => ({
        ...acc,
        [cur[primary_key]]: cur,
    }),{});
    return Object.values(myMap);
}