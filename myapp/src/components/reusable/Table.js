import React from 'react';
import Badge from './Badge';

export const TOTAL_SLOTS = 42;

const Table = ({ rack, name, onRefresh }) => {
  const sortedRack = [...rack].sort((a, b) => b.startSlot - a.startSlot); // Sort in descending order

  const combineRowsWithEmptySlots = (data) => {
    let currentSlot = TOTAL_SLOTS;
    const combinedRows = [];
    
    for (const item of data) {
      // Add empty slots before the current item if there's a gap
      if (item.startSlot < currentSlot) {
        for (let i = currentSlot; i > item.startSlot + item.size - 1; i--) {
          combinedRows.push({
            name: '',
            startSlot: i,
            endSlot: i,
            color: 'transparent',
            rows: 1,
          });
        }
      }

      // Add the current item
      combinedRows.push({
        ...item,
        rows: item.size,
        endSlot: item.startSlot,
        startSlot: item.startSlot + item.size - 1
      });

      // Update the current slot to the next slot after the current item
      currentSlot = item.startSlot - 1;
    }
      
    // Add empty slots at the beginning if needed
    if (currentSlot > 0) {
      for (let i = currentSlot; i > 0; i--) {
        combinedRows.push({
          name: '',
          startSlot: i,
          endSlot: i,
          color: 'transparent',
          rows: 1,
        });
      }
    }

    return combinedRows;
  };

  const rowsWithRowCount = combineRowsWithEmptySlots(sortedRack);

  return (
    <table className="w-full table-fixed text-center bg-gray-200 shadow-lg rounded-md overflow-hidden">
      <thead className="bg-gray-800 text-white">
        <tr>
          <th className="py-4 px-6 text-xl font-semibold">{name} Rack</th>
        </tr>
      </thead>
      <tbody>
        {rowsWithRowCount.map(({ name, startSlot, endSlot, color, rows, _id }, groupIndex) => {
          const indexDisplay = startSlot === endSlot ? `${startSlot}` : `${endSlot}-${startSlot}`;
          const rowHeight = `${rows * 3}rem`;
  
          return (
            <tr key={groupIndex} className="border-b border-gray-300 hover:bg-gray-100 transition-colors duration-200">
              <td className="relative" style={{ height: rowHeight }}>
                <div className="absolute inset-0 flex items-center">
                  <span className="absolute left-0 pl-2 text-gray-600 font-medium select-none">
                    {indexDisplay}.
                  </span>
                  <div className="ml-6 w-full flex justify-center items-center">
                    <span className="w-10/12">
                      {name ? (
                        <Badge 
                          label={name} 
                          color={color} 
                          componentDetails={_id ? rowsWithRowCount[groupIndex] : null} 
                          onSave={onRefresh}
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-100 rounded-md" />
                      )}
                    </span>
                  </div>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
      <tfoot className="bg-gray-800 text-white">
        <tr>
          <th className="py-4 px-6 text-xl font-semibold">{name} Rack</th>
        </tr>
      </tfoot>
    </table>
  );
};

export default Table;
