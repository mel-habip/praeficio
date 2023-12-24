export default function nth(number) {

    if (number > 20) {
        let stringified = number.toString();
        let lastDigit = stringified.split('').pop();

        switch (lastDigit) {
            case '1':
                return `${number}st`;
            case '2':
                return `${number}nd`;
            case '3':
                return `${number}rd`;
            default:
                return `${number}th`;
        };
    }

    switch (number) {
        case 1:
            return `${number}st`;
        case 2:
            return `${number}nd`;
        case 3:
            return `${number}rd`;
        default:
            return `${number}th`;
    };
}