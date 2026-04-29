import mongoose from "mongoose";
import { reserveStock } from "../modules/inventory/inventory.service";
import { Inventory } from "../models/inventory.model";
import { InventoryLog } from "../models/inventory.log.model";
import { env } from "../config/env.config";

const TEST_SKU = "CONCURRENCY_TEST_SKU";
const INITIAL_STOCK = 10;
const REQUESTS = 15;

const verifyInventorySystem = async () => {
    try {
        await mongoose.connect(env.MONGO_URI as string);
        console.log("Connected to MongoDB");

        // 1. Setup
        console.log(`Setting up test SKU: ${TEST_SKU} with ${INITIAL_STOCK} units`);
        await Inventory.deleteOne({ sku: TEST_SKU });
        await InventoryLog.deleteMany({ sku: TEST_SKU });

        await Inventory.create({
            sku: TEST_SKU,
            quantity: INITIAL_STOCK,
        });

        // 2. Run Concurrent Requests
        console.log(`Simulating ${REQUESTS} concurrent purchase requests for 1 unit each...`);

        const promises = [];
        for (let i = 0; i < REQUESTS; i++) {
            promises.push(reserveStock(TEST_SKU, 1, `mock_order_${i}`));
        }

        const results = await Promise.all(promises);

        // 3. Analyze Results
        const successes = results.filter(r => r === true).length;
        const failures = results.filter(r => r === false).length;

        console.log(`\nResults:`);
        console.log(`Successes: ${successes} (Expected: ${INITIAL_STOCK})`);
        console.log(`Failures: ${failures} (Expected: ${REQUESTS - INITIAL_STOCK})`);

        // 4. Verification from DB
        const finalInventory = await Inventory.findOne({ sku: TEST_SKU });
        console.log(`Final Database Stock: ${finalInventory?.quantity} (Expected: 0)`);

        const logs = await InventoryLog.find({ sku: TEST_SKU });
        console.log(`Inventory Logs Count: ${logs.length} (Expected: ${INITIAL_STOCK})`);

        // Assertions
        if (successes !== INITIAL_STOCK) throw new Error("Incorrect number of successful reservations!");
        if (failures !== (REQUESTS - INITIAL_STOCK)) throw new Error("Incorrect number of failed reservations!");
        if (finalInventory?.quantity !== 0) throw new Error("Final stock should be 0!");

        console.log("\n✅ Inventory Concurrency Test Passed! Race conditions handled correctly.");

    } catch (error) {
        console.error("\n❌ Verification Failed:", error);
    } finally {
        // Cleanup
        if (mongoose.connection.readyState !== 0) {
            await Inventory.deleteOne({ sku: TEST_SKU });
            await InventoryLog.deleteMany({ sku: TEST_SKU });
            await mongoose.disconnect();
        }
    }
};

verifyInventorySystem();
