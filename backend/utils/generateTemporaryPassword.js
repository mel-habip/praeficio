/**
 * @function generateTemporaryPassword - generates a random temporary password
 * @param {Number} passwordLength - length of the password to be generated
 * @return {String} returns password of length param `passwordLength`
 */
export default function generateTemporaryPassword(passwordLength = 14) {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let password = "";
    for (let i = 0; i < passwordLength; i++) {
        let randomNumber = Math.floor(Math.random() * chars.length);
        password += chars[randomNumber];
    };
    return password;
};