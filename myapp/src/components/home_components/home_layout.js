import React, { useState, useEffect } from 'react';
import axios from "axios";
import Table_New from '../reusable/Table';
import ScrollButtons from '../reusable/ScrollButtons';

const Layout = ({ dataCenter }) => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [normalizedRacks, setNormalizedRacks] = useState({});
    const [loading, setLoading] = useState(false); // State to track loading

    // Updated color mapping based on 'type' field
    const colorMapping = {
        1: "rgba(255, 0, 0, 0.7)",    // type 1 is for servers
        2: "rgba(0, 0, 255, 0.7)",    // type 2 is for general storage devices
        3: "rgba(0, 128, 0, 0.7)",    // type 3 is for switches
        4: "rgba(255, 165, 0, 0.7)",  // type 4 is for tape drives
        5: "rgba(200, 165, 0, 0.7)",  // type 5 is for others
    };

    const getItemType = (item) => {
        return colorMapping[item.type] || 'rgba(200, 200, 200, 0.6)'; // Default gray color
    };

    useEffect(() => {
        async function fetchData() {
            setLoading(true); // Start loading
            try {
                const response = await axios.get(`/general/data-centers/${dataCenter}/components`);
                const data = response.data;

                const processedData = Object.entries(data).reduce((acc, [rackName, components]) => {
                    acc[rackName] = components.map(component => ({
                        ...component,
                        color: getItemType(component)
                    }));
                    return acc;
                }, {});
                setNormalizedRacks(processedData);
            } catch (error) {
                console.error("Error fetching components:", error);
            } finally {
                setLoading(false); // Stop loading
            }
        }

        fetchData();
    }, [dataCenter, refreshTrigger]);

    const rackOrder = ['Server', 'Network1', 'Network2', 'Storage', 'Peripheral'];

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className='relative'>
            {/* Loading bar */}
            {loading && <div className='absolute top-0 left-0 w-full h-1 bg-blue-500'></div>}
            
            {/* Page content */}
            <div className='flex mx-2 mb-4 border-r rounded-md border-none mt-1'>
                {rackOrder.map(rackName => (
                    <Table_New 
                        key={rackName} 
                        rack={normalizedRacks[rackName] || []}  // Pass an empty array if no data
                        name={rackName} 
                        onRefresh={handleRefresh} 
                    />
                ))}
            </div>
            <ScrollButtons/>
        </div>
    );
}

export default Layout;
