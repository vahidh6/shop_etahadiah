// frontend/src/components/Reports.js
const Reports = () => {
  const [reportType, setReportType] = useState('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);

  const generateReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/reports/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: reportType,
          startDate,
          endDate
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setReportData(data.report);
      }
    } catch (error) {
      toast.error('خطا در تولید گزارش');
    }
  };

  const exportToExcel = () => {
    // کد خروجی اکسل
  };

  return (
    <div style={styles.pageContainer}>
      <h1>📊 گزارش‌گیری</h1>
      
      <div style={styles.reportControls}>
        <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
          <option value="daily">گزارش روزانه</option>
          <option value="monthly">گزارش ماهانه</option>
          <option value="yearly">گزارش سالانه</option>
          <option value="custom">گزارش سفارشی</option>
        </select>
        
        {reportType === 'custom' && (
          <div style={styles.dateRange}>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        )}
        
        <button onClick={generateReport} style={styles.generateBtn}>
          🔄 تولید گزارش
        </button>
        
        {reportData && (
          <button onClick={exportToExcel} style={styles.exportBtn}>
            📥 خروجی Excel
          </button>
        )}
      </div>

      {reportData && (
        <div style={styles.reportContainer}>
          <h3>📈 نتایج گزارش</h3>
          <div style={styles.stats}>
            <div style={styles.statItem}>
              <span>تعداد کل:</span>
              <strong>{reportData.totalCount}</strong>
            </div>
            <div style={styles.statItem}>
              <span>مجموع مبالغ:</span>
              <strong>{reportData.totalAmount.toLocaleString()} ریال</strong>
            </div>
            <div style={styles.statItem}>
              <span>میانگین قیمت:</span>
              <strong>{reportData.averagePrice.toLocaleString()} ریال</strong>
            </div>
          </div>
          
          {/* جدول داده‌ها */}
          <table style={styles.reportTable}>
            <thead>
              <tr>
                <th>ردیف</th>
                <th>تاریخ</th>
                <th>تعداد</th>
                <th>مبلغ کل</th>
                <th>پرکارترین دوکاندار</th>
              </tr>
            </thead>
            <tbody>
              {reportData.details.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.date}</td>
                  <td>{item.count}</td>
                  <td>{item.amount.toLocaleString()} ریال</td>
                  <td>{item.topShopOwner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};