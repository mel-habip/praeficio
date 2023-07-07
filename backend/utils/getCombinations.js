//sourced from https://stackoverflow.com/a/59942031/15648633
export default function getCombinations(valuesArray) {
    var combi = [];
    var temp = [];

    var slent = Math.pow(2, valuesArray.length);

    for (var i = 0; i < slent; i++) {
        temp = [];
        for (var j = 0; j < valuesArray.length; j++) {
            if ((i & Math.pow(2, j))) {
                temp.push(valuesArray[j]);
            }
        }
        if (temp.length > 0) {
            combi.push(temp);
        }
    }

    combi.sort((a, b) => a.length - b.length);
    // console.log(combi.join("\n"));
    return combi;
}