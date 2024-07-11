import React, { useState, useEffect } from 'react'
import Table from '../reusable/Table'
import axios from "axios"

const Layout = ({ dataCenter }) => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [normalizedRacks, setNormalizedRacks] = useState({});

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
                
            }
        }

        fetchData();
    }, [dataCenter, refreshTrigger]);

    if (Object.keys(normalizedRacks).length === 0) {
        return <div className='p-4 text-xl font-bold'>Gathering Assets...</div>;
    }

    const rackOrder = ['Server', 'Network1', 'Network2', 'Storage', 'Peripheral'];

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className='flex mx-2 mb-4 border-r rounded-md border-black'>
            {rackOrder.map(rackName => {
                if (normalizedRacks[rackName]) {
                    return <Table key={rackName} rack={normalizedRacks[rackName]} name={rackName} onRefresh={handleRefresh}/>;
                }
                return null;
            })}
        </div>
    )
}

export default Layout