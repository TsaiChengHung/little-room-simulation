import React, { useState, useMemo } from 'react';
import useSelectionStore from '../Store/Store';
import './QuotationPanel.css';

const QuotationPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { roomData, objects } = useSelectionStore();

  // 計算報價資料
  const quotationData = useMemo(() => {
    if (!roomData) return { materials: [], objects: [], totalAmount: 0 };

    // 處理材質項目
    const materials = [];
    let materialsTotal = 0;

    // 直接遍歷所有 roomData 中的物件
    Object.entries(roomData).forEach(([key, item]) => {
      if (item && item.price > 0) {
        const itemTotal = item.price * (item.area || 1);
        
        // 根據不同類型物件顯示不同的名稱
        let itemName = '';
        if (key === 'floor') {
          itemName = `地板 (${item.materialName || '未命名材質'})`;
        } else if (key === 'ceiling') {
          itemName = `天花板 (${item.materialName || '未命名材質'})`;
        } else if (key.includes('wall')) {
          const wallIndex = key.replace('wall', '');
          itemName = `牆面 ${wallIndex} (${item.materialName || '未命名材質'})`;
        } else {
          itemName = `${key} (${item.materialName || '未命名材質'})`;
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

    // 處理物件項目
    const objectItems = [];
    let objectsTotal = 0;

    Object.keys(objects).forEach(category => {
      objects[category].forEach(item => {
        if (item.price > 0) {
          objectItems.push({
            name: item.objectName || '未命名物件',
            price: item.price
          });
          objectsTotal += item.price;
        }
      });
    });

    // 計算總價
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
            <h2>室內設計報價單</h2>
            <button className="close-button" onClick={togglePanel}>×</button>
          </div>
          
          <div className="quotation-content">
            <h3>材質項目</h3>
            {quotationData.materials.length > 0 ? (
              <table className="quotation-table">
                <thead>
                  <tr>
                    <th>項目</th>
                    <th>面積(m²)</th>
                    <th>單價($/m²)</th>
                    <th>小計($)</th>
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
                    <td colSpan="3">材質小計</td>
                    <td>${quotationData.materialsTotal.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <p>沒有套用任何付費材質</p>
            )}

            <h3>家具物件</h3>
            {quotationData.objects.length > 0 ? (
              <table className="quotation-table">
                <thead>
                  <tr>
                    <th>項目</th>
                    <th>價格($)</th>
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
                    <td>家具小計</td>
                    <td>${quotationData.objectsTotal.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <p>未添加任何家具</p>
            )}

            <div className="total-section">
              <h3>總計金額: ${quotationData.totalAmount.toFixed(2)}</h3>
            </div>
          </div>
        </div>
      )}
      
      <button 
        className="quotation-button" 
        onClick={togglePanel}
        title="查看報價單"
      >
        報價單
      </button>
    </div>
  );
};

export default QuotationPanel; 