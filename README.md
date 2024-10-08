# ONGC Hardware Asset Management System

## Project Overview
This project is designed to manage hardware assets and contracts within data centers. It allows admins to:
- Add new contracts, specifying associated assets and vendor details.
- Manage components, assigning them to specific data centers and racks.

## Data Flow Overview
### 1. Contract Management:
Admins can create new contracts. Each contract must include:
- **Vendor Details**: Information about the vendor.
- **Associated Assets**: Each asset is linked to the contract and includes specific details.
- **Component Association**: Components can also be linked to a contract.

### 2. Component Management:
Admins manage components across three data centers, with each data center containing up to five racks. Components include various specifications and can be assigned to a specific slot within a rack.

### Schema Design
The MongoDB schema for this project is organized into the following models:

1. **Vendor Schema**:
   - Fields: `vendorName`, `email`, `mob`, `contracts[]`
   - Each vendor is associated with multiple contracts.

2. **DataCenter Schema**:
   - Fields: `name`, `index`
   - Represents the data centers where components are stored.

3. **Rack Schema**:
   - Fields: `dataCenterId`, `name`, `index`
   - Each rack is part of a data center and can hold multiple components.

4. **Component Schema**:
   - Fields: `name`, `type`, `specifications`, `size`, `dataCenterId`, `rackId`, `startSlot`, `customFields[]`
   - Components are detailed, including specifications like RAM, HDD, and slots.

5. **Asset Schema**:
   - Fields: `inventoryNo`, `name`, `type`, `description`, `contractId`, `component`, `vendorId`
   - Assets are tied to specific contracts and can be linked to components.

6. **Contract Schema**:
   - Fields: `contractorDetails`, `contractNo`, `assetIds[]`, `components[]`, `quantity`, `from`, `to`
   - Defines contracts, including vendor, asset, and component details.

### Key Features
- **Contract Management**: Allows for the addition, update, and deletion of contracts.
- **Component Management**: Components can be assigned to specific racks within data centers.
- **Asset Management**: Assets are tracked and linked to contracts and components.

## Installation and Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
2. Navigate to the project directory:
   ```bash
   cd ONGC_RACK_NEW
3. Install backend dependencies:
   ```bash
   cd backend && npm install
4. Install frontend dependencies:
   ```bash
   cd myapp && npm install
5. Start the backend server:
   ```bash
   cd backend && node server.js
6. Start the frontend server:
   ```bash
   npm run start

## Usage

    Access the frontend at http://localhost:3000
    Backend server runs on http://localhost:5000

## Major Version Release Summary

### v1.0 (Current - Alpha)
- **First Prototype**: This version includes a complete end-to-end lifecycle of components.
  - **Features**:
    - New components can be added to a specific Data Center and Rack.
    - Complete details of each component are available and can be modified by Admins.
    - A naive login system is in place with minimal security.
  - **Limitations**:
    - No Contract Management is included.

### v1.1 (60% Complete) - Beta Release
- **In Progress**: This version focuses on improving database performance and introducing contract management.
  - **Features**:
    - Database Optimizations.
    - End-to-end Contract Management.
    - Centralized, secure login system.
  - **Timeline**: Expected release in 2 weeks (as of 13-08-24).

### v1.2 - Main Release
- **Planned**: This version aims to enhance user experience and introduce advanced features.
  - **Features**:
    - Polished User Experience.
    - Contract + Time integration to notify users about the nearing end of contract tenure.
    - Advanced Querying and Data Visualization.
  - **Timeline**: Expected release in 5 weeks (as of 13-08-24).



   
