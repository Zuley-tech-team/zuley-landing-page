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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const inventory_service_1 = require("../modules/inventory/inventory.service");
const inventory_model_1 = require("../models/inventory.model");
const inventory_log_model_1 = require("../models/inventory.log.model");
const env_config_1 = require("../config/env.config");
const TEST_SKU = "CONCURRENCY_TEST_SKU";
const INITIAL_STOCK = 10;
const REQUESTS = 15;
const verifyInventorySystem = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(env_config_1.env.MONGO_URI);
        console.log("Connected to MongoDB");
        // 1. Setup
        console.log(`Setting up test SKU: ${TEST_SKU} with ${INITIAL_STOCK} units`);
        yield inventory_model_1.Inventory.deleteOne({ sku: TEST_SKU });
        yield inventory_log_model_1.InventoryLog.deleteMany({ sku: TEST_SKU });
        yield inventory_model_1.Inventory.create({
            sku: TEST_SKU,
            quantity: INITIAL_STOCK,
        });
        // 2. Run Concurrent Requests
        console.log(`Simulating ${REQUESTS} concurrent purchase requests for 1 unit each...`);
        const promises = [];
        for (let i = 0; i < REQUESTS; i++) {
            promises.push((0, inventory_service_1.reserveStock)(TEST_SKU, 1, `mock_order_${i}`));
        }
        const results = yield Promise.all(promises);
        // 3. Analyze Results
        const successes = results.filter(r => r === true).length;
        const failures = results.filter(r => r === false).length;
        console.log(`\nResults:`);
        console.log(`Successes: ${successes} (Expected: ${INITIAL_STOCK})`);
        console.log(`Failures: ${failures} (Expected: ${REQUESTS - INITIAL_STOCK})`);
        // 4. Verification from DB
        const finalInventory = yield inventory_model_1.Inventory.findOne({ sku: TEST_SKU });
        console.log(`Final Database Stock: ${finalInventory === null || finalInventory === void 0 ? void 0 : finalInventory.quantity} (Expected: 0)`);
        const logs = yield inventory_log_model_1.InventoryLog.find({ sku: TEST_SKU });
        console.log(`Inventory Logs Count: ${logs.length} (Expected: ${INITIAL_STOCK})`);
        // Assertions
        if (successes !== INITIAL_STOCK)
            throw new Error("Incorrect number of successful reservations!");
        if (failures !== (REQUESTS - INITIAL_STOCK))
            throw new Error("Incorrect number of failed reservations!");
        if ((finalInventory === null || finalInventory === void 0 ? void 0 : finalInventory.quantity) !== 0)
            throw new Error("Final stock should be 0!");
        console.log("\n✅ Inventory Concurrency Test Passed! Race conditions handled correctly.");
    }
    catch (error) {
        console.error("\n❌ Verification Failed:", error);
    }
    finally {
        // Cleanup
        if (mongoose_1.default.connection.readyState !== 0) {
            yield inventory_model_1.Inventory.deleteOne({ sku: TEST_SKU });
            yield inventory_log_model_1.InventoryLog.deleteMany({ sku: TEST_SKU });
            yield mongoose_1.default.disconnect();
        }
    }
});
verifyInventorySystem();
