const uppercaseRegex = /[A-Z]/;
const lowercaseRegex = /[a-z]/;
const numberRegex = /[0-9]/;
const symbolRegex = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

export default function validatePassword(string = '', showDetailed = false) {
    //requires a number, an uppercase, a lowercase and a special character, min 6, max 15
    const hasLength = (string.length > 6) && (string.length < 15);
    if (!showDetailed && !hasLength) return false;


    //technically this setup means we keep testing even though it failed already, but its too little of a gain to optimize further
    const hasUppercase = uppercaseRegex.test(string);
    const hasLowercase = lowercaseRegex.test(string);
    const hasNumber = numberRegex.test(string);
    const hasSymbol = symbolRegex.test(string);

    const hasAll = hasLength && hasUppercase && hasLowercase && hasNumber && hasSymbol;

    if (showDetailed) {
        return {
            hasUppercase,
            hasLowercase,
            hasNumber,
            hasSymbol,
            hasLength,
            hasAll,
        }
    }

    return hasAll;
}