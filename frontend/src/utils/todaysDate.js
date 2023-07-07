export default function todaysDate() {
    const now = new Date();

    //makes into 2 digits
    const dig2 = v => v.toString().length === 1 ? '0' + v : v;

    const final = now.getFullYear() + "-" + dig2(now.getMonth() + 1) + "-" + dig2(now.getDate());

    return final;
}