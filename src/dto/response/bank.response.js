class GetBankResponse {
    constructor(data) {
        this.name = data.name
        this.bin = data.bin
        this.shortName = data.shortName
        this.logo = data.logo
    }
}
module.exports = { GetBankResponse };
