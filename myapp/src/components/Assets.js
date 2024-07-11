import React, { useState } from 'react';

const initialContracts = [
  {
    contractor: 'CYGNUS INFORMATION SOLUTIONS PVT LTD.',
    contractNo: 9010031884,
    assetDescription: 'High performance servers',
    assetName: 'Dell PowerEdge R940',
    assetType: 'Server',
    quantity: 5,
    email: 'techsupport@cygnussolutions.co.in',
    mob: '7715963567',
    from: '2023-11-14',
    to: '2027-11-13',
    assets: [
      {
        inventoryNo: '10B1D6300083',
        name: 'Fujitsu RX300 S8 Server',
        type: 'SERVER WORK STATION',
        description: 'Fujitsu RX300 S8 Server'
      },
      {
        inventoryNo: '10B1D6300091',
        name: 'Dell PowerEdge R730',
        type: 'SERVER WORK STATION',
        description: 'Dell PowerEdge R730'
      },
      {
        inventoryNo: '10B1D6300092',
        name: 'Dell PowerEdge R940',
        type: 'SERVER WORK STATION',
        description: 'Dell PowerEdge R940'
      },
      {
        inventoryNo: '10B1D6300093',
        name: 'Dell PowerEdge R940',
        type: 'SERVER WORK STATION',
        description: 'Dell PowerEdge R940'
      },
      {
        inventoryNo: '10B1D6300094',
        name: 'Dell PowerEdge R740',
        type: 'SERVER WORK STATION',
        description: 'Dell PowerEdge R740'
      }
    ]
  }
];

const Assets = () => {
  const [contracts, setContracts] = useState(initialContracts);
  const [isAddContractOpen, setIsAddContractOpen] = useState(false);
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [newContract, setNewContract] = useState({
    contractor: '',
    contractNo: '',
    assetDescription: '',
    assetName: '',
    assetType: '',
    quantity: 0,
    email: '',
    mob: '',
    from: '',
    to: ''
  });
  const [newAsset, setNewAsset] = useState({
    inventoryNo: '',
    name: '',
    type: '',
    description: ''
  });
  const [selectedContract, setSelectedContract] = useState(null);

  const handleAddContract = () => {
    setContracts([...contracts, { ...newContract, assets: [] }]);
    setIsAddContractOpen(false);
    setNewContract({
      contractor: '',
      contractNo: '',
      assetDescription: '',
      assetName: '',
      assetType: '',
      quantity: 0,
      email: '',
      mob: '',
      from: '',
      to: ''
    });
  };

  const handleAddAsset = () => {
    setContracts(contracts.map(contract => {
      if (contract.contractNo === selectedContract.contractNo) {
        return {
          ...contract,
          assets: [...contract.assets, newAsset]
        };
      }
      return contract;
    }));
    setIsAddAssetOpen(false);
    setNewAsset({
      inventoryNo: '',
      name: '',
      type: '',
      description: ''
    });
  };

  return (
    <div className="bg-gray-100 p-6 font-sans">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Assets Dashboard</h1>
      <div className="mb-6 flex justify-between items-center">
        <button
          className="px-4 py-2 bg-red-600 text-white rounded"
          onClick={() => setIsAddContractOpen(true)}
        >
          Add Contract
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="px-4 py-2 text-left">Contract No.</th>
              <th className="px-4 py-2 text-left">Contractor</th>
              <th className="px-4 py-2 text-left">Asset Name</th>
              <th className="px-4 py-2 text-left">Asset Type</th>
              <th className="px-4 py-2 text-left">From</th>
              <th className="px-4 py-2 text-left">To</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((contract, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="border px-4 py-2">{contract.contractNo}</td>
                <td className="border px-4 py-2">{contract.contractor}</td>
                <td className="border px-4 py-2">{contract.assetName}</td>
                <td className="border px-4 py-2">{contract.assetType}</td>
                <td className="border px-4 py-2">{contract.from}</td>
                <td className="border px-4 py-2">{contract.to}</td>
                <td className="border px-4 py-2">
                  <button
                    className="px-2 py-1 bg-blue-500 text-white rounded"
                    onClick={() => {
                      setSelectedContract(contract);
                      setIsAddAssetOpen(true);
                    }}
                  >
                    Add Asset
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAddContractOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">Add New Contract</h3>
            <input
              className="w-full p-2 mb-2 border rounded"
              placeholder="Contractor"
              value={newContract.contractor}
              onChange={(e) => setNewContract({ ...newContract, contractor: e.target.value })}
            />
            <input
              className="w-full p-2 mb-2 border rounded"
              placeholder="Contract No."
              value={newContract.contractNo}
              onChange={(e) => setNewContract({ ...newContract, contractNo: e.target.value })}
            />
            <input
              className="w-full p-2 mb-2 border rounded"
              placeholder="Asset Description"
              value={newContract.assetDescription}
              onChange={(e) => setNewContract({ ...newContract, assetDescription: e.target.value })}
            />
            <input
              className="w-full p-2 mb-2 border rounded"
              placeholder="Asset Name"
              value={newContract.assetName}
              onChange={(e) => setNewContract({ ...newContract, assetName: e.target.value })}
            />
            <input
              className="w-full p-2 mb-2 border rounded"
              placeholder="Asset Type"
              value={newContract.assetType}
              onChange={(e) => setNewContract({ ...newContract, assetType: e.target.value })}
            />
            <input
              className="w-full p-2 mb-2 border rounded"
              type="number"
              placeholder="Quantity"
              value={newContract.quantity}
              onChange={(e) => setNewContract({ ...newContract, quantity: parseInt(e.target.value) })}
            />
            <input
              className="w-full p-2 mb-2 border rounded"
              placeholder="Email"
              value={newContract.email}
              onChange={(e) => setNewContract({ ...newContract, email: e.target.value })}
            />
            <input
              className="w-full p-2 mb-2 border rounded"
              placeholder="Mobile"
              value={newContract.mob}
              onChange={(e) => setNewContract({ ...newContract, mob: e.target.value })}
            />
            <input
              className="w-full p-2 mb-2 border rounded"
              type="date"
              placeholder="From"
              value={newContract.from}
              onChange={(e) => setNewContract({ ...newContract, from: e.target.value })}
            />
            <input
              className="w-full p-2 mb-2 border rounded"
              type="date"
              placeholder="To"
              value={newContract.to}
              onChange={(e) => setNewContract({ ...newContract, to: e.target.value })}
            />
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded mr-2"
                onClick={handleAddContract}
              >
                Add
              </button>
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded"
                onClick={() => setIsAddContractOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {isAddAssetOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">Add New Asset</h3>
            <input
              className="w-full p-2 mb-2 border rounded"
              placeholder="Inventory No."
              value={newAsset.inventoryNo}
              onChange={(e) => setNewAsset({ ...newAsset, inventoryNo: e.target.value })}
            />
            <input
              className="w-full p-2 mb-2 border rounded"
              placeholder="Name"
              value={newAsset.name}
              onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
            />
            <input
              className="w-full p-2 mb-2 border rounded"
              placeholder="Type"
              value={newAsset.type}
              onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
            />
            <input
              className="w-full p-2 mb-2 border rounded"
              placeholder="Description"
              value={newAsset.description}
              onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })}
            />
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded mr-2"
                onClick={handleAddAsset}
              >
                Add
              </button>
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded"
                onClick={() => setIsAddAssetOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;

