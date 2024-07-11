const express = require('express');
const router = express.Router();

const { Vendor, DataCenter, Rack, Component } = require('../schema')



//TODO: Implement middleware to check for authorization before handling requests

// Test
// router.get('/protected-data', (req, res) => {
//   // Handle admin-specific data access request
//   res.send('Admin data response!');
// });

router.post('/:dataCenterIndex/addcomponent', async (req, res) => {
    try {
        const dataCenter = await DataCenter.findOne({ index: req.params.dataCenterIndex });
        const rack = await Rack.findOne({
            name: { $regex: new RegExp(req.body.rack, 'i') },
            dataCenterId: dataCenter._id
        });
        const vendor = await Vendor.findOne({ vendorID: parseInt(req.body.vendor, 10) });
        console.log(req.body.vendor)

        if (!rack) {
            return res.status(404).json({ message: 'Rack not found' });
        }

        // Common specifications for all types
        const commonSpecs = {
            serialNo: req.body.serviceTag,
            makeModel: req.body.makeModel,
            vendorID: vendor._id,
        };

        // Type-specific specifications
        let typeSpecificSpecs = {};
        switch (req.body.type) {
            case '1': // Server
                typeSpecificSpecs = {
                    ram: req.body.ram,
                    hdd: req.body.hdd,
                    processor: req.body.processor,
                };
                break;
            case '2': // Storage(general)
            case '5': // other
                break;
            case '3': // Switches
                typeSpecificSpecs = {
                    ports: req.body.ports,
                };
                break;
            case '4': // Tape Drives
                typeSpecificSpecs = {
                    drives: req.body.drives,
                    slots: req.body.slots,
                };
                break;
            default:
                return res.status(400).json({ message: 'Invalid component type' });
        }

        // Combine common and type-specific specifications
        const specifications = { ...commonSpecs, ...typeSpecificSpecs };

        const newComponent = new Component({
            type: req.body.type,
            name: req.body.name,
            dataCenterId: rack.dataCenterId,
            rackId: rack._id,
            startSlot: req.body.startSlot,
            size: req.body.size,
            specifications: specifications,
            customFields: req.body.customFields,
        });

        await newComponent.save();
        res.status(201).json(newComponent);
    } catch (err) {
        console.error("Error adding component:", err);
        res.status(500).json({ message: 'Error adding component', error: err.message });
    }
});

// Delete a component
router.delete('/components/:id', async (req, res) => {
    try {
        const componentId = req.params.id;

        // Check if the component exists
        const component = await Component.findById(componentId);
        if (!component) {
            return res.status(404).json({ message: 'Component not found' });
        }

        // Delete the component
        await Component.findByIdAndDelete(componentId);
        console.log("Successfully Deleted!")

        res.status(200).json({ message: 'Component deleted successfully' });
    } catch (error) {
        console.error('Error deleting component:', error);
        res.status(500).json({ message: 'Error deleting component', error: error.message });
    }
});

router.put('/edit-component/:id', async (req, res) => {
    try {

        const { id } = req.params;
        const { specifications, customFields } = req.body;
        console.log("API HIT!HERE ARE SPECS: ", specifications)



        const updatedComponent = await Component.findByIdAndUpdate(
            id,
            { $set: { specifications: specifications, customFields: customFields } },
            { new: true, runValidators: true }
        );

        if (!updatedComponent) {
            return res.status(404).json({ message: 'Component not found' });
        }

        res.status(200).json(updatedComponent);
    } catch (error) {
        console.error('Error updating component:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

module.exports = router;
