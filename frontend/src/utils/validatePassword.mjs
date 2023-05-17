const uppercaseRegex = /[A-Z]/;
const lowercaseRegex = /[a-z]/;
const numberRegex = /[0-9]/;
const symbolRegex = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

export default function validatePassword(string = '') {
    //requires a number, an uppercase, a lowercase and a special character, min 6, max 15
    if (string.length < 6) return false;
    if (string.length > 15) return false;

    //technically this setup means we keep testing even though it failed already, but its too little of a gain to optimize further
    const hasUppercase = uppercaseRegex.test(string);
    const hasLowercase = lowercaseRegex.test(string);
    const hasNumber = numberRegex.test(string);
    const hasSymbol = symbolRegex.test(string);

    return hasUppercase && hasLowercase && hasNumber && hasSymbol;
}