const axios = require("axios");
const BankError = require("../errors/BankError");

const bankServices = {
    getBank: async (req) => {
        try {
            const keyword = req.query.keyword;
            const response = await axios.get(process.env.GET_BANK_ENDPOINT, {
                headers: {
                    'x-client-id': process.env.CLIENT_ID,
                    'x-api-key': process.env.API_KEY
                }
            });
            if (!response.data || !response.data.data) {
                throw BankError.InvalidResponse();
            }
            let banks = response.data.data;
            if (keyword) {
                const lowerKeyword = keyword.toLowerCase();
                banks = banks.filter(bank =>
                    (bank.name && bank.name.toLowerCase().includes(lowerKeyword)) ||
                    (bank.shortName && bank.shortName.toLowerCase().includes(lowerKeyword))
                );
            }

            return banks;
        } catch (err) {
            if (err.response) {
                throw BankError.ApiError(`API ngân hàng trả về lỗi ${err.response.status}`);
            } else if (err.request) {
                throw BankError.ApiError("Không nhận được phản hồi từ API ngân hàng");
            } else {
                throw BankError.ApiError(err.message);
            }
        }
    },
};

module.exports = bankServices;
