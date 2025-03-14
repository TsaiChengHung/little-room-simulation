import React, { useState, useMemo } from 'react';
import useSelectionStore from '../Store/Store';
import './QuotationPanel.css';

const QuotationPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { roomData, objects } = useSelectionStore();

  // Calculate quotation data
  const quotationData = useMemo(() => {
    if (!roomData) return { materials: [], objects: [], totalAmount: 0 };

    // Process material items
    const materials = [];
    let materialsTotal = 0;

    // Directly iterate through all objects in roomData
    Object.entries(roomData).forEach(([key, item]) => {
      if (item && item.price > 0) {
        const itemTotal = item.price * (item.area || 1);
        
        // Display different names based on object type
        let itemName = '';
        if (key === 'floor') {
          itemName = `Floor (${item.materialName || 'Unnamed Material'})`;
        } else if (key === 'ceiling') {
          itemName = `Ceiling (${item.materialName || 'Unnamed Material'})`;
        } else if (key.includes('wall')) {
          const wallIndex = key.replace('wall', '');
          itemName = `Wall ${wallIndex} (${item.materialName || 'Unnamed Material'})`;
        } else {
          itemName = `${key} (${item.materialName || 'Unnamed Material'})`;
        }
        
        materials.push({
          name: itemName,
          area: item.area ? item.area.toFixed(2) : 'N/A',
          unitPrice: item.price,
          total: itemTotal
        });
        
        materialsTotal += itemTotal;
      }
    });

    // Process object items
    const objectItems = [];
    let objectsTotal = 0;

    Object.keys(objects).forEach(category => {
      objects[category].forEach(item => {
        if (item.price > 0) {
          objectItems.push({
            name: item.objectName || 'Unnamed Object',
            price: item.price
          });
          objectsTotal += item.price;
        }
      });
    });

    // Calculate total price
    const totalAmount = materialsTotal + objectsTotal;

    return {
      materials,
      objects: objectItems,
      materialsTotal,
      objectsTotal,
      totalAmount
    };
  }, [roomData, objects]);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="quotation-container">
      {isOpen && (
        <div className="quotation-panel">
          <div className="quotation-header">
            <h2>Interior Design Quotation</h2>
            <button className="close-button" onClick={togglePanel}>×</button>
          </div>
          
          <div className="quotation-content">
            <h3>Materials</h3>
            {quotationData.materials.length > 0 ? (
              <table className="quotation-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Area(m²)</th>
                    <th>Unit Price($/m²)</th>
                    <th>Subtotal($)</th>
                  </tr>
                </thead>
                <tbody>
                  {quotationData.materials.map((item, index) => (
                    <tr key={`material-${index}`}>
                      <td>{item.name}</td>
                      <td>{item.area}</td>
                      <td>${item.unitPrice}</td>
                      <td>${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="subtotal-row">
                    <td colSpan="3">Materials Subtotal</td>
                    <td>${quotationData.materialsTotal.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <p>No paid materials applied</p>
            )}

            <h3>Furniture & Objects</h3>
            {quotationData.objects.length > 0 ? (
              <table className="quotation-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Price($)</th>
                  </tr>
                </thead>
                <tbody>
                  {quotationData.objects.map((item, index) => (
                    <tr key={`object-${index}`}>
                      <td>{item.name}</td>
                      <td>${item.price.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="subtotal-row">
                    <td>Furniture Subtotal</td>
                    <td>${quotationData.objectsTotal.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <p>No furniture added</p>
            )}

            <div className="total-section">
              <h3>Total Amount: ${quotationData.totalAmount.toFixed(2)}</h3>
            </div>
          </div>
        </div>
      )}
      
      <button 
        className="quotation-button" 
        onClick={togglePanel}
        title="View Quotation"
      >
        Quotation
      </button>
    </div>
  );
};

export default QuotationPanel; 