export default function timestampFormatter(date) {

    if (!date) return '';

    if (typeof date === 'string') {
        date = new Date(date);
    }

    console.log(date)

    let hour = date.getHours();
    let minute = twoDig(date.getMinutes());
    let month = twoDig(date.getMonth() + 1);
    let year = date.getFullYear();
    let day = twoDig(date.getDate());

    let am_pm = hour > 12 ? (hour -= 12, 'pm') : 'am';

    return `${year}/${month}/${day} ${hour}:${minute}${am_pm}`;
};

function twoDig(str) {
    return String(str).length === 2 ? str : `0` + str;
}