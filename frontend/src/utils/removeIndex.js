export default function removeIndex(ar, index_to_remove) {
    const arClone = [...ar];
    arClone.splice(index_to_remove, 1);
    return arClone;
}