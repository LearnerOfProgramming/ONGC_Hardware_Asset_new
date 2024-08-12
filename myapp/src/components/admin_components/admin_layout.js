import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { TOTAL_SLOTS } from '../reusable/Table';

const initialComponentState = {
    type: '',
    name: '',
    startSlot: '',
    rack: '',
    size: 1,
    customFields: [],
    vendor: '',
    vendorID: '',
    serviceTag: 'N/A',
    makeModel: 'N/A',
    ram: 'N/A',
    hdd: 'N/A',
    processor: 'N/A',
    ports: 'N/A',
    drives: 'N/A',
    slots: 'N/A'
};

const componentTypes = {
    1: 'server',
    2: 'storage',
    3: 'switch',
    4: 'tape drive',
    5: 'others'
};

const Layout_Admin = ({ dataCenter }) => {
    const [components, setComponents] = useState({
        'Rack 1': [],
        'Rack 2': [],
        'Rack 3': [],
    });
    const [name, setName] = useState(''); // Set a default name
    const [stats, setStats] = useState({
      componentsByType: {}, // Set default stats
      componentsByRack: {},
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [vendors, setVendors] = useState([]);
    const [selectedVendorIds, setSelectedVendorIds] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);


    const [newComponent, setNewComponent] = useState(initialComponentState);

    const [availableSlots, setAvailableSlots] = useState([]);

    const rackTypes = ['Server', 'Network1', 'Network2', 'Storage', 'Peripheral'];

    const addCustomField = () => {
        setNewComponent(prev => ({
            ...prev,
            customFields: [...prev.customFields, { name: '', type: 'string', value: '' }]
        }));
    };

    const removeCustomField = (index) => {
        setNewComponent(prev => ({
            ...prev,
            customFields: prev.customFields.filter((_, i) => i !== index)
        }));
    };

    const handleCustomFieldChange = (index, key, value) => {
        setNewComponent(prev => ({
            ...prev,
            customFields: prev.customFields.map((field, i) =>
                i === index ? { ...field, [key]: value } : field
            )
        }));
        validateForm();
    };

    const updateComponents = (data) => {
        setComponents(c => ({ ...c, ...data }));
    };

    const fetchComponents = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get('/general/vendors');

            const vendorInfo = res.data.map(vendor => ({
                id: vendor._id,
                name: vendor.vendorName,
                vendorIDs: vendor.vendorID
            }));
            setVendors(vendorInfo);

            const vendorIdMap = {};
            vendorInfo.forEach(vendor => {
                vendorIdMap[vendor.id] = vendor.vendorIDs;
            });
            setSelectedVendorIds(vendorIdMap);

            const response = await axios.get(`/general/data-centers/${dataCenter}/components`);
            updateComponents(response.data); <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <StatisticsCard title="Components by Type">
                    {Object.keys(stats.componentsByType).length === 0 ? (
                        <div className="text-gray-500">No components to display</div>
                    ) : (
                        Object.entries(stats.componentsByType).map(([type, count]) => (
                            <StatItem
                                key={type}
                                label={componentTypes[type]}
                                value={count}
                            />
                        ))
                    )}
                </StatisticsCard>

                <StatisticsCard title="Components by Rack">
                    {Object.keys(stats.componentsByRack).length === 0 ? (
                        <div className="text-gray-500">No components to display</div>
                    ) : (
                        Object.entries(stats.componentsByRack).map(([rack, count]) => (
                            <StatItem
                                key={rack}
                                label={rack}
                                value={count}
                            />
                        ))
                    )}
                </StatisticsCard>
            </div>
            calculateStats(response.data);
            setLoading(false);
        } catch (err) {
            setError('Error fetching components');
            setLoading(false);
        }
    }, [dataCenter]);

    useEffect(() => {
        fetchComponents();

        switch (dataCenter) {
            case 1:
                setName('G&G Data Center');
                break;
            case 2:
                setName('VRC');
                break;
            case 3:
                setName('DR');
                break;
            default:
                setName('Unknown Data Center');
                break;
        }
    }, [dataCenter, fetchComponents]); // TODO:Remove unnecessary dependencies

    useEffect(() => {
        if (newComponent.vendor) {
            const firstVendorID = selectedVendorIds[newComponent.vendor]?.[0] || '';
            setNewComponent(prev => ({ ...prev, vendorID: firstVendorID }));
        }
    }, [newComponent.vendor, selectedVendorIds]);

    const calculateStats = useCallback((data) => {
        const stats = {
            totalComponents: 0,
            componentsByType: {},
            componentsByRack: {},
        };

        Object.values(data).forEach(rackComponents => {
            rackComponents.forEach(component => {
                stats.totalComponents++;
                stats.componentsByType[component.type] = (stats.componentsByType[component.type] || 0) + 1;
                stats.componentsByRack[component.rackId.name] = (stats.componentsByRack[component.rackId.name] || 0) + 1;
            });
        });

        setStats(stats);
    }, []);


    const calculateAvailableSlots = (rack, data) => {
        const occupiedSlots = new Set();

        if (data[rack]) {
            data[rack].forEach(component => {
                for (let i = component.startSlot; i < component.startSlot + component.size; i++) {
                    occupiedSlots.add(i);
                }
            });
        }

        const availableSlots = Array.from({ length: TOTAL_SLOTS }, (_, i) => i + 1).filter(slot => {
            for (let j = 0; j < newComponent.size; j++) {
                if (occupiedSlots.has(slot + j)) {
                    return false;
                }
            }
            return true;
        });

        setAvailableSlots(availableSlots);
    };

    const handleDelete = async (componentId) => {
        if (window.confirm('Are you sure you want to delete this component?')) {
            try {
                await axios.delete(`/admin/components/${componentId}`);
                fetchComponents();
            } catch (err) {
                setError('Error deleting component');
            }
        }
    };

    const validateForm = () => {
        const requiredFields = ['type', 'name', 'startSlot', 'rack', 'size', 'vendor', 'vendorID'];
        const isValid = requiredFields.every(field => newComponent[field] !== '');
        setIsFormValid(isValid);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'vendor') {
            const firstVendorID = selectedVendorIds[value]?.[0] || '';
            setNewComponent(prev => ({
                ...prev,
                [name]: value,
                vendorID: firstVendorID
            }));
        } else {
            setNewComponent(prev => ({ ...prev, [name]: value }));
        }
        if (name === 'rack') {
            calculateAvailableSlots(value, components);
        }
        validateForm();
    };

    const resetForm = () => {
        setNewComponent(initialComponentState);
        setIsFormValid(false);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        resetForm();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const componentData = {
                ...newComponent,
                vendorID: newComponent.vendorID,
            };
            console.log("Sending data:", JSON.stringify(componentData));
            await axios.post(`/admin/${dataCenter}/addcomponent`, JSON.stringify(componentData), {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                }
            });
            alert('Successfully added!')
            closeDialog();
            fetchComponents();
        } catch (err) {
            console.error("Error adding component:", err.response?.data || err.message);
            setError(err.response?.data?.message || 'Error adding component');
        }
    };

    const renderComponentFields = () => {
        switch (newComponent.type) {
            case '1': // Server
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <div>
                            <label htmlFor="serviceTag" className="block text-sm font-medium text-red-800 mb-1">Service Tag / SN</label>
                            <input
                                type="text"
                                id="serviceTag"
                                name="serviceTag"
                                value={newComponent.serviceTag || ''}
                                onChange={handleInputChange}
                                placeholder="Enter Service Tag / SN"
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="makeModel" className="block text-sm font-medium text-red-800 mb-1">Make / Model</label>
                            <input
                                type="text"
                                id="makeModel"
                                name="makeModel"
                                value={newComponent.makeModel || ''}
                                onChange={handleInputChange}
                                placeholder="Enter Make / Model"
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="ram" className="block text-sm font-medium text-red-800 mb-1">RAM (GB)</label>
                            <input
                                type="number"
                                id="ram"
                                name="ram"
                                value={newComponent.ram || ''}
                                onChange={handleInputChange}
                                placeholder="Enter RAM in GB"
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="hdd" className="block text-sm font-medium text-red-800 mb-1">HDD (GB)</label>
                            <input
                                type="number"
                                id="hdd"
                                name="hdd"
                                value={newComponent.hdd || ''}
                                onChange={handleInputChange}
                                placeholder="Enter HDD in GB"
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="processor" className="block text-sm font-medium text-red-800 mb-1">Processor</label>
                            <input
                                type="text"
                                id="processor"
                                name="processor"
                                value={newComponent.processor || ''}
                                onChange={handleInputChange}
                                placeholder="Enter Processor details"
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>
                );
            case '2': // Storage
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <div>
                            <label htmlFor="serviceTag" className="block text-sm font-medium text-red-800 mb-1">Service Tag / SN</label>
                            <input
                                type="text"
                                id="serviceTag"
                                name="serviceTag"
                                value={newComponent.serviceTag || ''}
                                onChange={handleInputChange}
                                placeholder="Enter Service Tag / SN"
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="makeModel" className="block text-sm font-medium text-red-800 mb-1">Make / Model</label>
                            <input
                                type="text"
                                id="makeModel"
                                name="makeModel"
                                value={newComponent.makeModel || ''}
                                onChange={handleInputChange}
                                placeholder="Enter Make / Model"
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>
                );
            case '3': // Switch
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <div>
                            <label htmlFor="serviceTag" className="block text-sm font-medium text-red-800 mb-1">Service Tag / SN</label>
                            <input
                                type="text"
                                id="serviceTag"
                                name="serviceTag"
                                value={newComponent.serviceTag || ''}
                                onChange={handleInputChange}
                                placeholder="Enter Service Tag / SN"
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="makeModel" className="block text-sm font-medium text-red-800 mb-1">Make / Model</label>
                            <input
                                type="text"
                                id="makeModel"
                                name="makeModel"
                                value={newComponent.makeModel || ''}
                                onChange={handleInputChange}
                                placeholder="Enter Make / Model"
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="ports" className="block text-sm font-medium text-red-800 mb-1">Number of Ports</label>
                            <input
                                type="number"
                                id="ports"
                                name="ports"
                                value={newComponent.ports || ''}
                                onChange={handleInputChange}
                                placeholder="Enter number of ports"
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>
                );
            case '4': // Tape Drive
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <div>
                            <label htmlFor="serviceTag" className="block text-sm font-medium text-red-800 mb-1">Service Tag / SN</label>
                            <input
                                type="text"
                                id="serviceTag"
                                name="serviceTag"
                                value={newComponent.serviceTag || ''}
                                onChange={handleInputChange}
                                placeholder="Enter Service Tag / SN"
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="makeModel" className="block text-sm font-medium text-red-800 mb-1">Make / Model</label>
                            <input
                                type="text"
                                id="makeModel"
                                name="makeModel"
                                value={newComponent.makeModel || ''}
                                onChange={handleInputChange}
                                placeholder="Enter Make / Model"
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="drives" className="block text-sm font-medium text-red-800 mb-1">Number of Drives</label>
                            <input
                                type="number"
                                id="drives"
                                name="drives"
                                value={newComponent.drives || ''}
                                onChange={handleInputChange}
                                placeholder="Enter number of drives"
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="slots" className="block text-sm font-medium text-red-800 mb-1">Number of Slots</label>
                            <input
                                type="number"
                                id="slots"
                                name="slots"
                                value={newComponent.slots || ''}
                                onChange={handleInputChange}
                                placeholder="Enter number of slots"
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const renderAvailableSlots = () => {
        return (
            <select
                id="startSlot"
                name="startSlot"
                value={newComponent.startSlot}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
            >
                <option value="">Select Start Slot</option>
                {availableSlots.map(slot => (
                    <option key={slot} value={slot}>
                        {slot}
                    </option>
                ))}
            </select>
        );
    };

    const StatisticsCard = ({ title, children }) => (
        <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">{title}</h3>
            <ul className="space-y-2">
                {children}
            </ul>
        </div>
    );

    const StatItem = ({ label, value }) => (
        <li className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
            <span className="text-gray-600 capitalize">{label}</span>
            <span className="font-semibold text-gray-800">{value}</span>
        </li>
    );

    if (loading) {
        return <div className='p-4 text-xl font-bold'>Loading...</div>;
    }

   

    return (
        <div className="container mx-auto p-4 bg-gray-100">
            {/* Error message at the top */}
            {error && (
                <div className="bg-red-500 text-white py-2 px-4 text-sm font-medium rounded-b-md">
                    {error}
                </div>
            )}
            <div className="p-6 bg-white rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    Data Center Admin - {name}
                </h1>



                <div className="bg-gray-50 shadow-lg rounded-xl p-6">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-6">Statistics</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <StatisticsCard title="Components by Type">
                            {loading ? (
                                <div className="flex justify-center items-center h-32">
                                    <div className="w-8 h-8 border-4 border-red-500 rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                Object.entries(stats.componentsByType).map(([type, count]) => (
                                    <StatItem key={type} label={componentTypes[type]} value={count} />
                                ))
                            )}
                        </StatisticsCard>

                        <StatisticsCard title="Components by Rack">
                            {loading ? (
                                <div className="flex justify-center items-center h-32">
                                    <div className="w-8 h-8 border-4 border-red-500 rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                Object.entries(stats.componentsByRack).map(([rack, count]) => (
                                    <StatItem key={rack} label={rack} value={count} />
                                ))
                            )}
                        </StatisticsCard>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-lg rounded-lg p-6 my-6">
                <h2 className="text-2xl font-semibold text-gray-700 mb-6">Add New Component</h2>
                <p className="text-gray-600 mb-4">Click the button below to add a new component to the data center.</p>
                <button
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition duration-300 ease-in-out shadow-md"
                >
                    Add New Component
                </button>
            </div>

            {isDialogOpen && (
                <div
                    className="fixed inset-0 bg-gray-800 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-40"
                    onClick={closeDialog}
                >
                    <div
                        className="relative pt-10 p-8 bg-white w-11/12 md:w-4/5 lg:w-3/4 rounded-lg shadow-2xl z-50 max-h-[70vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-2xl font-bold mb-6 text-red-800 border-b border-red-200 pb-2">Add New Component</h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label htmlFor="type" className="block text-sm font-medium text-red-800 mb-1">Component Type</label>
                                    <select
                                        id="type"
                                        name="type"
                                        value={newComponent.type}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                                        required
                                    >
                                        <option value="">Select Component Type</option>
                                        {Object.entries(componentTypes).map(([key, value]) => (
                                            <option key={key} value={key}>{value}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-red-800 mb-1">Component Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={newComponent.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter component name"
                                        className="w-full p-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="rack" className="block text-sm font-medium text-red-800 mb-1">Rack</label>
                                    <select
                                        id="rack"
                                        name="rack"
                                        value={newComponent.rack}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                                        required
                                    >
                                        <option value="">Select Rack</option>
                                        {rackTypes.map((rack, index) => (
                                            <option key={index} value={rack}>{rack}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="size" className="block text-sm font-medium text-red-800 mb-1">Slots Occupied</label>
                                    <select
                                        id="size"
                                        name="size"
                                        value={newComponent.size}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                                        required
                                    >
                                        <option value="">Select Slots Occupied</option>
                                        {Array.from({ length: TOTAL_SLOTS - newComponent.startSlot + 1 }, (_, i) => i + 1).map((slot) => (
                                            <option key={slot} value={slot}>{slot}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="startSlot" className="block text-sm font-medium text-red-800 mb-1">Start Slot</label>
                                    {renderAvailableSlots()}
                                </div>
                                <div>
                                    <label htmlFor="vendor" className="block text-sm font-medium text-red-800 mb-1">Vendor</label>
                                    <select
                                        id="vendor"
                                        name="vendor"
                                        value={newComponent.vendor}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                                        required
                                    >
                                        <option value="">Select Vendor</option>
                                        {vendors.map((vendor) => (
                                            <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {newComponent.vendor && (
                                    <div>
                                        <label htmlFor="vendorID" className="block text-sm font-medium text-red-800 mb-1">Vendor ID</label>
                                        <select
                                            id="vendorID"
                                            name="vendorID"
                                            value={newComponent.vendorID}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                                            required
                                        >
                                            <option value="">Select Vendor ID</option>
                                            {selectedVendorIds[newComponent.vendor]?.map((id) => (
                                                <option key={id} value={id}>{id}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {renderComponentFields()}

                            {/* Custom Fields Section */}
                            <div className="mt-6 bg-gray-100 p-4 rounded-md border border-red-200">
                                <h4 className="text-lg font-semibold text-red-800 mb-4">Custom Fields</h4>
                                {newComponent.customFields.map((field, index) => (
                                    <div key={index} className="flex flex-wrap items-center space-x-2 mb-4">
                                        <input
                                            type="text"
                                            value={field.name}
                                            onChange={(e) => handleCustomFieldChange(index, 'name', e.target.value)}
                                            placeholder="Field Name"
                                            className="flex-grow p-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                                        />
                                        <select
                                            value={field.type}
                                            onChange={(e) => handleCustomFieldChange(index, 'type', e.target.value)}
                                            className="p-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                                        >
                                            <option value="string">String</option>
                                            <option value="number">Number</option>
                                            <option value="date">Date</option>
                                        </select>
                                        <input
                                            type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                                            value={field.value}
                                            onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                                            placeholder="Field Value"
                                            className="flex-grow p-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeCustomField(index)}
                                            className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-300"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addCustomField}
                                    className="mt-2 px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 transition-colors duration-300"
                                >
                                    Add Custom Field
                                </button>
                            </div>

                            <div className="flex justify-end space-x-4 mt-8">
                                <button
                                    type="button"
                                    onClick={closeDialog}
                                    className="px-6 py-2 bg-gray-300 text-red-800 rounded-md hover:bg-gray-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!isFormValid}
                                    className={`px-6 py-2 ${isFormValid ? 'bg-red-800 hover:bg-red-900' : 'bg-gray-400 cursor-not-allowed'} text-white rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500`}
                                >
                                    Add Component
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Component Dashboard</h2>

                {Object.entries(components).map(([rackName, rackComponents]) => (
                    <div key={rackName} className="mb-8 bg-white rounded-lg shadow-md overflow-hidden">
                        <h3 className="text-lg font-semibold bg-red-800 text-white p-4">{rackName}</h3>
                        <ul className="divide-y divide-gray-200">
                            {[...rackComponents].sort((a, b) => a.startSlot - b.startSlot).map(component => (
                                <li key={component._id} className="p-4 hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                                        <div className="flex-1">
                                            <span className="font-medium text-gray-800">{component.name}</span>
                                            <div className="text-sm text-gray-600 mt-1">
                                                <span className="inline-block bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs font-semibold mr-2">
                                                    {componentTypes[component.type] || component.type}
                                                </span>
                                                <span className="mr-2">Slot: {component.startSlot}</span>
                                                <span>Slots Occupied: {component.size}</span>
                                            </div>
                                        </div>
                                        <div className="flex ">
                                            <button
                                                onClick={() => handleDelete(component._id)}
                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Layout_Admin;