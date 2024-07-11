const express = require('express');
const router = express.Router();

// Test
// router.get('/data', (req, res) => {
//   // Handle general data access request
//   res.send('General data response!');
// });

const { Vendor, DataCenter, Rack, Component } = require('../schema')




async function getComponentsByDataCenterGroupedByRack(dataCenterId) {
    try {
        // Get all racks belonging to the data center
        const racks = await Rack.find({ dataCenterId: dataCenterId });

        // Get rack names 
        const RackNames = new Set(racks.map(rack => rack.name));

        const groupedComponents = {};
        for (const rackName of RackNames) {
            groupedComponents[rackName] = [];
        }

        // Find components belonging to each rack
        const components = await Component.find({ dataCenterId: dataCenterId })
            .populate('specifications.vendorID')
            .populate('rackId');

        for (const component of components) {
            const rackName = component.rackId.name // Find rack name
            groupedComponents[rackName].push(component);
        }

        return groupedComponents;
    } catch (error) {
        console.error("Error retrieving components:", error);
        throw error; // Re-throw for error handling in your route handler
    }
}

router.get('/data-centers/:dataCenterIndex/components', async (req, res) => {
    const dataCenterIndex = parseInt(req.params.dataCenterIndex); // Convert index string to number
    try {
        //   Match a document with provided index value
        // console.log("Index:", dataCenterIndex)

        const dataCenter = await DataCenter.findOne({ index: dataCenterIndex });
        // console.log("Document:", dataCenter)


        if (!dataCenter) {
            return res.status(404).send("Data center not found for the provided index");
        }
        const dataCenterId = dataCenter._id; // Get dataCenterId from the retrieved document

        const groupedComponents = await getComponentsByDataCenterGroupedByRack(dataCenterId);
        res.json(groupedComponents);
    } catch (error) {
        res.status(500).send("Error retrieving components");

    }
});

// GET all vendors
router.get('/vendors', async (req, res) => {
    try {
        const vendors = await Vendor.find();
        // console.log(vendors)
        res.json(vendors);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/vendors', async (req, res) => {
    try {
        const {vendorName , vendorID } = req.body;
        // console.log(newVendor)
        const newVendor = new Vendor({
            vendorName: vendorName,
            vendorID: Number(vendorID),
        });
        await newVendor.save();
        res.status(200).send("Added Vendor Successfully")
        
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

router.get('/data-centers', async (req, res) => {
    try {
        const dataCenters = await DataCenter.find();
        res.json(dataCenters);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/components', async (req, res) => {
    try {
        const components = await Component.find()
            .populate('specifications.vendorID')
            .populate('rackId');
        res.json(components);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



module.exports = router;
