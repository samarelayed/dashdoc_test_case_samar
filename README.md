# Delivery Checker Solution

## Overview

This is a JavaScript implementation of a delivery path validation system that helps logistics companies optimize truck routes. The program takes a list of deliveries and a proposed truck path, then determines if the path can complete all deliveries efficiently and generates step-by-step instructions for the driver.

### What It Does

- **Validates** delivery paths to ensure all pickups and dropoffs are possible
- **Generates** detailed step-by-step instructions for truck drivers
- **Detects** common routing errors like missing addresses or invalid sequences
- **Provides** clear error messages to help fix problematic routes

## How to Run the Solution

### Prerequisites
- Node.js (version 12 or higher)

### Quick Start

1. **Clone or download the project files**
2. **Navigate to the project directory**:
   ```bash
   cd Dashdog
   ```

3. **Run the program**:
   ```bash
   node deliverychecker.js "[[1,3],[2,5]]" "[1,2,3,4,5]"
   ```

### Command Format

```bash
node deliverychecker.js "<deliveries>" "<path>"
```

- **`<deliveries>`**: JSON array of delivery pairs `[[pickup1,dropoff1],[pickup2,dropoff2],...]`
- **`<path>`**: JSON array of addresses the truck will visit `[addr1,addr2,addr3,...]`

### Example Usage

#### ✅ Successful Route
```bash
node deliverychecker.js "[[1,3],[2,5]]" "[1,2,3,4,5]"
```
**Output:**
```json
{
  "status": "success",
  "steps": [
    {"address": 1, "action": "pickup"},
    {"address": 2, "action": "pickup"},
    {"address": 3, "action": "dropoff"},
    {"address": 4, "action": null},
    {"address": 5, "action": "dropoff"}
  ]
}
```

#### ❌ Route with Missing Address
```bash
node deliverychecker.js "[[1,2],[3,4]]" "[1,2,4]"
```
**Output:**
```json
{
  "status": "error",
  "error_code": "delivery_address_not_in_path",
  "error_message": "The following delivery addresses are not in the path: 3"
}
```

#### ❌ Route with Invalid Sequence
```bash
node deliverychecker.js "[[1,3],[2,4]]" "[1,4,2,3]"
```
**Output:**
```json
{
  "status": "error",
  "error_code": "delivery_dropoff_before_pickup",
  "error_message": "Dropoff at address 4 comes before pickup at address 2 in the path"
}
```

## Running Tests

### Run All Tests
```bash
# Direct execution
node deliverychecker.test.js

# Using npm
npm test
```

### Run Demo Examples
```bash
npm run demo
```

### Test a Specific Example
```bash
npm run validate
```

## Understanding the Output

### Success Response
- **`status`**: Always `"success"` for valid paths
- **`steps`**: Array of instructions for each address in the path
  - **`address`**: The address number
  - **`action`**: What to do at this address:
    - `"pickup"`: Pick up a delivery
    - `"dropoff"`: Drop off a delivery
    - `null`: Just pass through (no action needed)

### Error Response
- **`status`**: Always `"error"` for invalid paths
- **`error_code`**: Specific error type for programmatic handling
- **`error_message`**: Human-readable explanation of the problem

### Error Types
| Error Code | Description |
|------------|-------------|
| `delivery_address_not_in_path` | Some pickup/dropoff addresses are missing from the truck's path |
| `delivery_dropoff_before_pickup` | A dropoff is scheduled before its corresponding pickup |
| `invalid_input` | Malformed JSON or invalid data structure |
| `invalid_arguments` | Wrong number of command-line arguments |

## Solution Architecture

### Algorithm Overview
1. **Parse Input**: Validate JSON format and data structure
2. **Address Validation**: Check all delivery addresses exist in the path
3. **Sequence Validation**: Ensure pickups occur before dropoffs
4. **Step Generation**: Create detailed instructions for the driver

### Performance
- **Time Complexity**: O(n + m) where n = path length, m = number of deliveries
- **Space Complexity**: O(n + m) for efficient lookup structures
- **Optimizations**: Uses Sets and Maps for O(1) address lookups

## 📁 Project Structure

```
Dashdog/
├── deliverychecker.js          # Main implementation
├── deliverychecker.test.js     # Unit tests (12 test cases)
├── package.json                # NPM configuration
└── README.md                   # This file
```

