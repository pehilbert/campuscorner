const CODE_LENGTH = 5;
const CODE_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";

module.exports = {
    getCode: () => {
        let code = "";

        for (let i = 0; i < CODE_LENGTH; i++) {
            code += CODE_CHARACTERS[Math.floor(Math.random() * CODE_CHARACTERS.length)];
        }

        return code;
    }
}