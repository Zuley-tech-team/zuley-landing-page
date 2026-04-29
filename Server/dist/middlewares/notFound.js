"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const notFoundMiddleware = (req, res, next) => {
    console.log("---notFoundMiddleware---");
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(http_status_codes_1.StatusCodes.NOT_FOUND);
    next(error);
};
exports.default = notFoundMiddleware;
