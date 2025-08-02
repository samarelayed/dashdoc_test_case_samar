#!/usr/bin/env node

function deliveryChecker(deliveriesStr, pathStr) {
    try {
        // Parse input
        const deliveries = JSON.parse(deliveriesStr);
        const path = JSON.parse(pathStr);
        
        // Validate input format
        if (!Array.isArray(deliveries) || !Array.isArray(path)) {
            throw new Error("Invalid input format");
        }
        
        // Create maps for quick lookup
        const pickupAddresses = new Set();
        const dropoffAddresses = new Set();
        const deliveryMap = new Map(); // pickup -> dropoff
        
        // Process deliveries
        for (const delivery of deliveries) {
            if (!Array.isArray(delivery) || delivery.length !== 2) {
                throw new Error("Invalid delivery format");
            }
            const [pickup, dropoff] = delivery;
            pickupAddresses.add(pickup);
            dropoffAddresses.add(dropoff);
            deliveryMap.set(pickup, dropoff);
        }
        
        // Check if all delivery addresses are in the path
        const pathSet = new Set(path);
        const missingAddresses = [];
        
        for (const pickup of pickupAddresses) {
            if (!pathSet.has(pickup)) {
                missingAddresses.push(pickup);
            }
        }
        
        for (const dropoff of dropoffAddresses) {
            if (!pathSet.has(dropoff)) {
                missingAddresses.push(dropoff);
            }
        }
        
        if (missingAddresses.length > 0) {
            return {
                status: "error",
                error_code: "delivery_address_not_in_path",
                error_message: `The following delivery addresses are not in the path: ${missingAddresses.join(', ')}`
            };
        }
        
        // Create position map for the path
        const positionMap = new Map();
        for (let i = 0; i < path.length; i++) {
            positionMap.set(path[i], i);
        }
        
        // Check if any dropoff comes before its pickup
        for (const [pickup, dropoff] of deliveryMap) {
            const pickupPos = positionMap.get(pickup);
            const dropoffPos = positionMap.get(dropoff);
            
            if (dropoffPos < pickupPos) {
                return {
                    status: "error",
                    error_code: "delivery_dropoff_before_pickup",
                    error_message: `Dropoff at address ${dropoff} comes before pickup at address ${pickup} in the path`
                };
            }
        }
        
        // Generate steps
        const steps = [];
        for (const address of path) {
            let action = null;
            
            // Priority: pickup takes precedence over dropoff if an address is both
            if (pickupAddresses.has(address)) {
                action = "pickup";
            } else if (dropoffAddresses.has(address)) {
                action = "dropoff";
            }
            
            steps.push({
                address: address,
                action: action
            });
        }
        
        return {
            status: "success",
            steps: steps
        };
        
    } catch (error) {
        return {
            status: "error",
            error_code: "invalid_input",
            error_message: `Failed to parse input: ${error.message}`
        };
    }
}

function main() {
    const args = process.argv.slice(2);
    
    if (args.length !== 2) {
        console.log(JSON.stringify({
            status: "error",
            error_code: "invalid_arguments",
            error_message: "Expected exactly 2 arguments: deliveries and path"
        }));
        process.exit(1);
    }
    
    const [deliveriesStr, pathStr] = args;
    const result = deliveryChecker(deliveriesStr, pathStr);
    
    console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
    main();
}

module.exports = { deliveryChecker };
