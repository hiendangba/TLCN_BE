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

export async function loadModels() {
    if (modelsLoaded) return; // nếu đã load rồi thì bỏ qua
    await Promise.all([
        faceApi.nets.tinyFaceDetector.loadFromDisk(MODELS_PATH),
        faceApi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH),
        faceApi.nets.faceRecognitionNet.loadFromDisk(MODELS_PATH)
    ]);
    modelsLoaded = true; // đánh dấu đã load xong
}

async function loadImageUrl(imageUrl) {
    const res = await fetch(imageUrl);
    const buffer = Buffer.from(await res.arrayBuffer());
    return canvas.loadImage(buffer);
}

export async function getDescriptorFromUrl(imageUrl) {
    const img = await loadImageUrl(imageUrl);

    const detection = await faceApi
        .detectSingleFace(img, new faceApi.TinyFaceDetectorOptions({ inputSize: 320 }))
        .withFaceLandmarks()
        .withFaceDescriptor();
    if (!detection) return null;

    return Array.from(detection.descriptor);
}

export async function createLabeled(users) {
    const labeledDescriptors = users.map(u =>
        new faceApi.LabeledFaceDescriptors(
            u.id.toString(),
            [Float32Array.from(JSON.parse(u.Student.Face.descriptor))]
        )
    );
    return labeledDescriptors
}

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

export async function hasFace(imageUrl) {
    const img = await loadImageUrl(imageUrl);
    const detections = await faceApi
        .detectAllFaces(img, new faceApi.TinyFaceDetectorOptions({ inputSize: 320 }));
    return detections.length > 0;
}
