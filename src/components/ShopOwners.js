// frontend/src/components/ShopOwners.js
const ShopOwners = () => {
  const [shopOwners, setShopOwners] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    password: '',
    shopName: '',
    address: ''
  });

  useEffect(() => {
    fetchShopOwners();
  }, []);

  const fetchShopOwners = async () => {
    // درخواست به API
  };

  const handleAddShopOwner = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/shop-owners', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        toast.success('دوکاندار با موفقیت اضافه شد');
        setShowAddForm(false);
        fetchShopOwners();
      }
    } catch (error) {
      toast.error('خطا در افزودن دوکاندار');
    }
  };

  return (
    <div style={styles.pageContainer}>
      <h1>👥 مدیریت دوکانداران</h1>
      
      <button 
        onClick={() => setShowAddForm(true)}
        style={styles.addButton}
      >
        ➕ افزودن دوکاندار جدید
      </button>

      {/* لیست دوکانداران */}
      <div style={styles.grid}>
        {shopOwners.map(owner => (
          <div key={owner.id} style={styles.card}>
            <h3>{owner.name}</h3>
            <p>📱 {owner.phoneNumber}</p>
            <p>🏪 {owner.shopName}</p>
            <div style={styles.cardActions}>
              <button style={styles.editBtn}>✏️ ویرایش</button>
              <button style={styles.deleteBtn}>🗑️ حذف</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};