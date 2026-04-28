"use strict";
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinary = exports.isCloudinaryConfigured = void 0;
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
const env_config_1 = require("./env.config");
const isConfigured = Boolean(env_config_1.env.CLOUDINARY_CLOUD_NAME) &&
    Boolean(env_config_1.env.CLOUDINARY_API_KEY) &&
    Boolean(env_config_1.env.CLOUDINARY_API_SECRET);
if (isConfigured) {
    cloudinary_1.v2.config({
        cloud_name: (_a = env_config_1.env.CLOUDINARY_CLOUD_NAME) === null || _a === void 0 ? void 0 : _a.trim().toLowerCase(),
        api_key: (_b = env_config_1.env.CLOUDINARY_API_KEY) === null || _b === void 0 ? void 0 : _b.trim(),
        api_secret: (_c = env_config_1.env.CLOUDINARY_API_SECRET) === null || _c === void 0 ? void 0 : _c.trim(),
    });
}
const isCloudinaryConfigured = () => isConfigured;
exports.isCloudinaryConfigured = isCloudinaryConfigured;
