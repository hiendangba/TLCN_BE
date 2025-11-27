import * as faceApi from 'face-api.js';
import canvas from 'canvas';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const { Canvas, Image, ImageData, loadImage } = canvas;

async function bufferToImage(buffer) {
    return await loadImage(buffer);
}

faceApi.env.monkeyPatch({ Canvas, Image, ImageData });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MODELS_PATH = path.join(__dirname, '../model_AI/face-api-models');

let modelsLoaded = false;

// Load các model face-api
export async function loadModels() {
    if (modelsLoaded) return; // nếu đã load rồi thì bỏ qua
    await Promise.all([
        faceApi.nets.tinyFaceDetector.loadFromDisk(MODELS_PATH),
        faceApi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH),
        faceApi.nets.faceRecognitionNet.loadFromDisk(MODELS_PATH)
    ]);
    modelsLoaded = true; // đánh dấu đã load xong
}

// Load ảnh từ URL
async function loadImageUrl(imageUrl) {
    const res = await fetch(imageUrl);
    const buffer = Buffer.from(await res.arrayBuffer());
    return canvas.loadImage(buffer);
}

export async function createLabeledDescriptors(users) {
    console.log(123123)
    return Promise.all(users.map(async (user) => {
        const img = await loadImage(user.avatar);
        const detection = await faceApi
            .detectSingleFace(img, new faceApi.TinyFaceDetectorOptions({ inputSize: 320 }))
            .withFaceLandmarks()
            .withFaceDescriptor();
        return new faceApi.LabeledFaceDescriptors(user.id.toString(), [detection.descriptor]);
    }));
}

// Nhận diện user từ ảnh mới
export async function recognizeFace(imageUrl, labeledDescriptors, threshold = 0.6) {
    const img = await bufferToImage(imageUrl);

    const detections = await faceApi
        .detectAllFaces(img, new faceApi.TinyFaceDetectorOptions({ inputSize: 320 }))
        .withFaceLandmarks()
        .withFaceDescriptors();
    if (!detections.length)
        return null;
    const faceMatcher = new faceApi.FaceMatcher(labeledDescriptors, threshold);
    return detections.map(d => {
        const bestMatch = faceMatcher.findBestMatch(d.descriptor);
        return {
            userId: bestMatch.label === 'unknown' ? null : bestMatch.label
        };
    });
}

// Kiểm tra có khuôn mặt không
export async function hasFace(imageUrl) {
    const img = await loadImageUrl(imageUrl);
    const detections = await faceApi
        .detectAllFaces(img, new faceApi.TinyFaceDetectorOptions({ inputSize: 320 }));
    return detections.length > 0;
}
