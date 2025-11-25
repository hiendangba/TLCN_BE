const path = require('path');
const ort = require('onnxruntime-node');
const { createCanvas, loadImage } = require('canvas');

const MODEL_PATH = path.join(__dirname, '../model_AI/face_detection_yunet_2023mar.onnx');

async function detectFace(imagePath, threshold = 0.8) {
    const session = await ort.InferenceSession.create(MODEL_PATH);
    const img = await loadImage(imagePath);

    const WIDTH = 640;
    const HEIGHT = 640;
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, WIDTH, HEIGHT);

    const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
    const data = Float32Array.from(imageData.data).filter((_, i) => i % 4 !== 3);

    const chwData = new Float32Array(3 * HEIGHT * WIDTH);
    for (let i = 0; i < HEIGHT * WIDTH; i++) {
        chwData[i] = data[i * 3];
        chwData[i + HEIGHT * WIDTH] = data[i * 3 + 1];
        chwData[i + 2 * HEIGHT * WIDTH] = data[i * 3 + 2];
    }

    const tensor = new ort.Tensor('float32', chwData, [1, 3, HEIGHT, WIDTH]);
    const feeds = { input: tensor };
    const results = await session.run(feeds);

    const bbox = results['bbox_32'].data; // [x, y, w, h]
    const obj = results['obj_32'].data;   // score object
    const cls = results['cls_32'].data;   // score class

    let bestFace = null;
    let bestScore = 0;

    for (let i = 0; i < obj.length; i++) {
        const score = obj[i] * cls[i];
        if (score > bestScore) {
            bestScore = score;
            bestFace = {
                x1: bbox[i * 4],
                y1: bbox[i * 4 + 1],
                x2: bbox[i * 4 + 2],
                y2: bbox[i * 4 + 3],
                score
            };
        }
    }
    let faces = [];
    if (bestScore > threshold) {
        faces.push(bestFace);
    }
    return faces;
}

module.exports = { detectFace };
