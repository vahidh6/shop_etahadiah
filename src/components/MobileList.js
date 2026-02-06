// frontend/src/components/MobileList.js
const MobileList = () => {
  const [mobiles, setMobiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchMobiles();
  }, [page]);

  const fetchMobiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/purchases?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setMobiles(data.data);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.pageHeader}>
        <h1>📱 لیست موبایل‌ها</h1>
        <button 
          onClick={() => window.location.href = '/mobiles/add'}
          style={styles.addButton}
        >
          ➕ ثبت جدید
        </button>
      </div>

      {loading ? (
        <div style={styles.loading}>در حال بارگذاری...</div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>شناسه</th>
                <th>برند</th>
                <th>مدل</th>
                <th>IMEI 1</th>
                <th>قیمت</th>
                <th>فروشنده</th>
                <th>تاریخ ثبت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {mobiles.map(mobile => (
                <tr key={mobile.id}>
                  <td>{mobile.id}</td>
                  <td>{mobile.brand}</td>
                  <td>{mobile.model}</td>
                  <td>{mobile.imei1}</td>
                  <td>{mobile.price.toLocaleString()} ریال</td>
                  <td>{mobile.sellerName}</td>
                  <td>{new Date(mobile.createdAt).toLocaleDateString('fa-IR')}</td>
                  <td>
                    <button style={styles.actionButton}>👁️ مشاهده</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div style={styles.pagination}>
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ◀ قبلی
            </button>
            <span>صفحه {page} از {totalPages}</span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              بعدی ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
};