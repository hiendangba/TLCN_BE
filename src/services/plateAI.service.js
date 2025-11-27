const axios = require("axios");
const FormData = require("form-data");

const API_KEY = process.env.PLATE_RECOGNIZER_API_KEY;

async function detectPlate(number, imageUrl) {
    try {
        const resImage = await axios.get(imageUrl, { responseType: "arraybuffer" });
        const fileBuffer = Buffer.from(resImage.data, "binary");

        const form = new FormData();
        form.append("upload", fileBuffer, { filename: "plate.jpg" });

        const res = await axios.post(
            "https://api.platerecognizer.com/v1/plate-reader/",
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    "Authorization": `Token ${API_KEY}`,
                },
            }
        );
        const plate = res.data?.results?.[0]?.plate;
        if (!plate) return false;

        return (plate.toUpperCase() === number.toUpperCase());
    } catch (err) {
        throw err;
    }
}

async function recognizePlate(imageUrl) {
    try {
        const form = new FormData();
        form.append("upload", imageUrl, { filename: "plate.jpg" });

        const res = await axios.post(
            "https://api.platerecognizer.com/v1/plate-reader/",
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    "Authorization": `Token ${API_KEY}`,
                },
            }
        );
        const plate = res.data?.results?.[0]?.plate;
        return plate || null;
    } catch (err) {
        throw err;
    }
}

module.exports = {
    detectPlate,
    recognizePlate
};
