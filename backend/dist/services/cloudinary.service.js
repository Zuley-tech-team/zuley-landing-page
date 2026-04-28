"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDataUrlImage = void 0;
exports.uploadImageBuffer = uploadImageBuffer;
exports.uploadDataUrlImage = uploadDataUrlImage;
const stream_1 = require("stream");
const cloudinary_config_1 = require("../config/cloudinary.config");
const env_config_1 = require("../config/env.config");
const DATA_URL_PATTERN = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/;
const parseDataUrlImage = (dataUrl) => {
    const match = dataUrl.match(DATA_URL_PATTERN);
    if (!match) {
        return null;
    }
    const [, mimeType, base64Data] = match;
    return {
        mimeType,
        buffer: Buffer.from(base64Data, "base64"),
    };
};
function uploadImageBuffer(buffer_1) {
    return __awaiter(this, arguments, void 0, function* (buffer, options = {}) {
        if (!(0, cloudinary_config_1.isCloudinaryConfigured)()) {
            throw new Error("Cloudinary is not configured");
        }
        const uploadFolder = options.folder || env_config_1.env.CLOUDINARY_FOLDER;
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_config_1.cloudinary.uploader.upload_stream({
                folder: uploadFolder,
                public_id: options.publicId,
                resource_type: "image",
            }, (error, result) => {
                if (error || !result) {
                    const message = typeof error === "object" && error !== null && "message" in error && typeof error.message === "string"
                        ? error.message
                        : error instanceof Error
                            ? error.message
                            : "Cloudinary upload failed";
                    reject(new Error(message));
                    return;
                }
                resolve({
                    secure_url: result.secure_url,
                    public_id: result.public_id,
                });
            });
            stream_1.Readable.from([buffer]).pipe(uploadStream);
        });
    });
}
function uploadDataUrlImage(dataUrl_1) {
    return __awaiter(this, arguments, void 0, function* (dataUrl, options = {}) {
        const parsed = parseDataUrlImage(dataUrl);
        if (!parsed) {
            throw new Error("Invalid image data URL");
        }
        return uploadImageBuffer(parsed.buffer, Object.assign({}, options));
    });
}
const isDataUrlImage = (value) => DATA_URL_PATTERN.test(value);
exports.isDataUrlImage = isDataUrlImage;
