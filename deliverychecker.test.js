const { deliveryChecker } = require('./deliverychecker.js');

function runTest(testName, deliveries, path, expectedResult, customValidator = null) {
    console.log(`\n🧪 Testing: ${testName}`);
    const result = deliveryChecker(deliveries, path);
    
    let passed;
    if (customValidator) {
        passed = customValidator(result, expectedResult);
    } else {
        passed = JSON.stringify(result) === JSON.stringify(expectedResult);
    }
    
    if (passed) {
        console.log('✅ PASSED');
    } else {
        console.log('❌ FAILED');
        console.log('Expected:', JSON.stringify(expectedResult, null, 2));
        console.log('Got:', JSON.stringify(result, null, 2));
    }
    
    return passed;
}

function validateMissingAddresses(result, expected) {
    if (result.status !== expected.status || result.error_code !== expected.error_code) {
        return false;
    }

    const resultAddresses = result.error_message.match(/\d+/g) || [];
    const expectedAddresses = expected.error_message.match(/\d+/g) || [];

    return JSON.stringify(resultAddresses.sort()) === JSON.stringify(expectedAddresses.sort());
}

function validateJSONError(result, expected) {
    return result.status === expected.status && 
           result.error_code === expected.error_code &&
           result.error_message.includes('Failed to parse input');
}

function runAllTests() {
    console.log('🚀 Running Delivery Checker Unit Tests\n');
    
    let passedTests = 0;
    let totalTests = 0;
    
    // Test 1: Basic success case
    totalTests++;
    if (runTest(
        'Basic success case',
        '[[1,3],[2,5]]',
        '[1,2,3,4,5]',
        {
            status: "success",
            steps: [
                { address: 1, action: "pickup" },
                { address: 2, action: "pickup" },
                { address: 3, action: "dropoff" },
                { address: 4, action: null },
                { address: 5, action: "dropoff" }
            ]
        }
    )) passedTests++;
    
    // Test 2: Missing address error
    totalTests++;
    if (runTest(
        'Missing address in path',
        '[[1,2],[3,4]]',
        '[1,2,4]',
        {
            status: "error",
            error_code: "delivery_address_not_in_path",
            error_message: "The following delivery addresses are not in the path: 3"
        }
    )) passedTests++;
    
    // Test 3: Dropoff before pickup error
    totalTests++;
    if (runTest(
        'Dropoff before pickup',
        '[[1,3],[2,4]]',
        '[1,4,2,3]',
        {
            status: "error",
            error_code: "delivery_dropoff_before_pickup",
            error_message: "Dropoff at address 4 comes before pickup at address 2 in the path"
        }
    )) passedTests++;
    
    // Test 4: Another success case
    totalTests++;
    if (runTest(
        'Success case with different order',
        '[[1,2],[3,4]]',
        '[1,3,2,4,5]',
        {
            status: "success",
            steps: [
                { address: 1, action: "pickup" },
                { address: 3, action: "pickup" },
                { address: 2, action: "dropoff" },
                { address: 4, action: "dropoff" },
                { address: 5, action: null }
            ]
        }
    )) passedTests++;
    
    // Test 5: Single delivery success
    totalTests++;
    if (runTest(
        'Single delivery success',
        '[[1,2]]',
        '[1,2]',
        {
            status: "success",
            steps: [
                { address: 1, action: "pickup" },
                { address: 2, action: "dropoff" }
            ]
        }
    )) passedTests++;
    
    // Test 6: Empty deliveries
    totalTests++;
    if (runTest(
        'Empty deliveries',
        '[]',
        '[1,2,3]',
        {
            status: "success",
            steps: [
                { address: 1, action: null },
                { address: 2, action: null },
                { address: 3, action: null }
            ]
        }
    )) passedTests++;
    
    // Test 7: Multiple missing addresses
    totalTests++;
    if (runTest(
        'Multiple missing addresses',
        '[[1,2],[3,4],[5,6]]',
        '[1,2]',
        {
            status: "error",
            error_code: "delivery_address_not_in_path",
            error_message: "The following delivery addresses are not in the path: 3, 4, 5, 6"
        },
        validateMissingAddresses
    )) passedTests++;
    
    // Test 8: Complex valid path
    totalTests++;
    if (runTest(
        'Complex valid path',
        '[[1,5],[2,6],[3,7]]',
        '[1,2,3,4,5,6,7,8]',
        {
            status: "success",
            steps: [
                { address: 1, action: "pickup" },
                { address: 2, action: "pickup" },
                { address: 3, action: "pickup" },
                { address: 4, action: null },
                { address: 5, action: "dropoff" },
                { address: 6, action: "dropoff" },
                { address: 7, action: "dropoff" },
                { address: 8, action: null }
            ]
        }
    )) passedTests++;
    
    // Test 9: Invalid JSON input
    totalTests++;
    if (runTest(
        'Invalid JSON deliveries',
        '[[1,2]',  // Missing closing bracket
        '[1,2]',
        {
            status: "error",
            error_code: "invalid_input",
            error_message: "Failed to parse input: Unexpected end of JSON input"
        },
        validateJSONError
    )) passedTests++;
    
    // Test 10: Invalid delivery format
    totalTests++;
    if (runTest(
        'Invalid delivery format',
        '[[1],[2,3,4]]',  // First delivery has only one element, second has three
        '[1,2,3,4]',
        {
            status: "error",
            error_code: "invalid_input",
            error_message: "Failed to parse input: Invalid delivery format"
        }
    )) passedTests++;
    
    // Test 11: Non-array input
    totalTests++;
    if (runTest(
        'Non-array deliveries input',
        '"not an array"',
        '[1,2,3]',
        {
            status: "error",
            error_code: "invalid_input",
            error_message: "Failed to parse input: Invalid input format"
        }
    )) passedTests++;
    
    // Test 12: Edge case - same pickup and dropoff addresses in different deliveries
    totalTests++;
    if (runTest(
        'Overlapping delivery addresses',
        '[[1,2],[2,3]]',
        '[1,2,3]',
        {
            status: "success",
            steps: [
                { address: 1, action: "pickup" },
                { address: 2, action: "pickup" },  // Pickup takes precedence when address is both pickup and dropoff
                { address: 3, action: "dropoff" }
            ]
        }
    )) passedTests++;

    console.log('\n' + '='.repeat(50));
    console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All tests passed! The implementation is working correctly.');
    } else {
        console.log(`⚠️  ${totalTests - passedTests} test(s) failed. Please review the implementation.`);
    }
    
    return passedTests === totalTests;
}

if (require.main === module) {
    runAllTests();
}

module.exports = { runAllTests };
