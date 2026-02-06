import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';

const MobileSchema = Yup.object().shape({
  imei1: Yup.string()
    .required('IMEI 1 الزامی است')
    .matches(/^[0-9]{15}$/, 'IMEI باید ۱۵ رقم باشد'),
  imei2: Yup.string()
    .matches(/^[0-9]{15}$/, 'IMEI باید ۱۵ رقم باشد'),
  brand: Yup.string().required('برند الزامی است'),
  sellerName: Yup.string().required('نام فروشنده الزامی است'),
  fatherName: Yup.string().required('نام پدر الزامی است'),
  sellerPhone: Yup.string()
    .required('شماره تماس فروشنده الزامی است')
    .matches(/^(0|\+93)?(7[0-9]{8}|[2-8][0-9]{7})$/, 'شماره تماس معتبر نیست'),
  address: Yup.string().required('آدرس الزامی است'),
});

const AddMobile = () => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState({
    sellerPhoto: null,
    tazkiraPhoto: null,
    thumbPhoto: null,
  });

  const handleFileChange = (field, file) => {
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error('حجم فایل باید کمتر از ۵ مگابایت باشد');
      return;
    }
    setFiles(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setUploading(true);
      
      // ایجاد FormData برای ارسال فایل‌ها
      const formData = new FormData();
      
      // اضافه کردن مقادیر فرم
      Object.keys(values).forEach(key => {
        formData.append(key, values[key]);
      });
      
      // اضافه کردن فایل‌ها
      if (files.sellerPhoto) formData.append('sellerPhoto', files.sellerPhoto);
      if (files.tazkiraPhoto) formData.append('tazkiraPhoto', files.tazkiraPhoto);
      if (files.thumbPhoto) formData.append('thumbPhoto', files.thumbPhoto);
      
      // ارسال به API
      const token = localStorage.getItem('token');
      const response = await fetch('https://back-end-v2-qxa5.onrender.com/api/purchases', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Note: Don't set Content-Type for FormData
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('✅ موبایل با موفقیت ثبت شد');
        resetForm();
        setFiles({
          sellerPhoto: null,
          tazkiraPhoto: null,
          thumbPhoto: null,
        });
        
        setTimeout(() => {
          navigate('/mobiles');
        }, 1500);
      } else {
        toast.error(`❌ ${data.message || 'خطا در ثبت موبایل'}`);
      }
    } catch (error) {
      console.error('Error adding mobile:', error);
      toast.error('🌐 خطا در ارتباط با سرور');
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  };

  // استایل‌های Inline
  const styles = {
    container: {
      direction: 'rtl',
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '30px',
      borderRadius: '15px',
      marginBottom: '30px',
      textAlign: 'center'
    },
    headerTitle: {
      fontSize: '28px',
      margin: '0 0 10px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '15px'
    },
    headerSubtitle: {
      fontSize: '16px',
      opacity: 0.9,
      margin: 0
    },
    formContainer: {
      background: 'white',
      borderRadius: '15px',
      padding: '30px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    },
    formSection: {
      marginBottom: '40px',
      paddingBottom: '30px',
      borderBottom: '2px solid #f3f4f6'
    },
    sectionTitle: {
      color: '#374151',
      fontSize: '22px',
      margin: '0 0 25px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '25px',
      marginBottom: '25px'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '10px',
      color: '#4b5563',
      fontWeight: '600',
      fontSize: '15px'
    },
    input: {
      width: '100%',
      padding: '14px 18px',
      border: '2px solid #e5e7eb',
      borderRadius: '10px',
      fontSize: '16px',
      transition: 'all 0.3s',
      background: '#f9fafb'
    },
    inputFocus: {
      borderColor: '#667eea',
      background: 'white',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
    },
    inputError: {
      borderColor: '#ef4444',
      background: '#fef2f2'
    },
    select: {
      width: '100%',
      padding: '14px 18px',
      border: '2px solid #e5e7eb',
      borderRadius: '10px',
      fontSize: '16px',
      background: '#f9fafb',
      cursor: 'pointer',
      appearance: 'none',
      backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236b7280\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'left 18px center',
      backgroundSize: '18px',
      paddingLeft: '45px'
    },
    textarea: {
      width: '100%',
      padding: '14px 18px',
      border: '2px solid #e5e7eb',
      borderRadius: '10px',
      fontSize: '16px',
      minHeight: '120px',
      resize: 'vertical',
      background: '#f9fafb',
      fontFamily: 'inherit'
    },
    errorText: {
      color: '#ef4444',
      fontSize: '13px',
      marginTop: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    fileUpload: {
      marginBottom: '25px'
    },
    fileUploadLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '12px',
      color: '#4b5563',
      fontWeight: '600',
      fontSize: '15px'
    },
    fileUploadArea: {
      border: '3px dashed #d1d5db',
      borderRadius: '12px',
      padding: '35px 20px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s',
      background: '#f9fafb',
      position: 'relative'
    },
    fileUploadAreaHover: {
      borderColor: '#667eea',
      background: '#f0f4ff'
    },
    fileInput: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
      opacity: 0,
      cursor: 'pointer'
    },
    uploadContent: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      color: '#6b7280'
    },
    uploadIcon: {
      fontSize: '32px',
      color: '#9ca3af'
    },
    filePreview: {
      marginTop: '15px',
      textAlign: 'center'
    },
    previewImage: {
      maxWidth: '200px',
      maxHeight: '200px',
      borderRadius: '10px',
      border: '2px solid #e5e7eb'
    },
    fileName: {
      margin: '8px 0 0 0',
      fontSize: '14px',
      color: '#4b5563'
    },
    formActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '15px',
      marginTop: '40px',
      paddingTop: '30px',
      borderTop: '2px solid #f3f4f6'
    },
    btnCancel: {
      padding: '14px 28px',
      background: '#f3f4f6',
      color: '#374151',
      border: 'none',
      borderRadius: '10px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s'
    },
    btnSubmit: {
      padding: '14px 28px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      minWidth: '150px'
    },
    btnDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },
    loadingSpinner: {
      display: 'inline-block',
      width: '20px',
      height: '20px',
      border: '3px solid rgba(255,255,255,0.3)',
      borderTopColor: 'white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginLeft: '10px'
    },
    icon: {
      fontSize: '20px'
    }
  };

  // کامپوننت FileUpload با استایل inline
  const FileUpload = ({ field, label, icon: IconComponent }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
      <div style={styles.fileUpload}>
        <div style={styles.fileUploadLabel}>
          <span style={styles.icon}>{IconComponent}</span>
          {label}
        </div>
        
        <div 
          style={{
            ...styles.fileUploadArea,
            ...(isHovered ? styles.fileUploadAreaHover : {})
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(field, e.target.files[0])}
            style={styles.fileInput}
          />
          
          <div style={styles.uploadContent}>
            <div style={styles.uploadIcon}>📁</div>
            <p style={{ margin: 0, fontSize: '16px' }}>
              {files[field]?.name || 'برای آپلود کلیک کنید یا فایل را بکشید'}
            </p>
            <span style={{ fontSize: '14px', color: '#9ca3af' }}>
              حداکثر حجم: ۵ مگابایت
            </span>
          </div>
        </div>
        
        {files[field] && (
          <div style={styles.filePreview}>
            <img 
              src={URL.createObjectURL(files[field])} 
              alt="پیش‌نمایش" 
              style={styles.previewImage}
            />
            <p style={styles.fileName}>
              📄 {files[field].name} ({(files[field].size / 1024 / 1024).toFixed(2)} MB)
            </p>
          </div>
        )}
      </div>
    );
  };

  // آیکون‌های جایگزین (چون react-icons نصب نیست)
  const icons = {
    Mobile: () => <span style={styles.icon}>📱</span>,
    User: () => <span style={styles.icon}>👤</span>,
    IdCard: () => <span style={styles.icon}>🪪</span>,
    Phone: () => <span style={styles.icon}>📞</span>,
    MapMarker: () => <span style={styles.icon}>📍</span>,
    Camera: () => <span style={styles.icon}>📷</span>,
    Upload: () => <span style={styles.icon}>⬆️</span>
  };

  return (
    <div style={styles.container}>
      {/* هدر صفحه */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>
          <icons.Mobile />
          ثبت موبایل جدید
        </h1>
        <p style={styles.headerSubtitle}>
          اطلاعات موبایل و فروشنده را به دقت وارد کنید
        </p>
      </div>

      {/* فرم اصلی */}
      <div style={styles.formContainer}>
        <Formik
          initialValues={{
            imei1: '',
            imei2: '',
            brand: '',
            sellerName: '',
            fatherName: '',
            sellerPhone: '',
            address: '',
            additionalInfo: '',
          }}
          validationSchema={MobileSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, handleBlur, handleFocus }) => (
            <Form>
              {/* بخش اطلاعات موبایل */}
              <div style={styles.formSection}>
                <h3 style={styles.sectionTitle}>
                  <icons.Mobile />
                  اطلاعات موبایل
                </h3>
                
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>IMEI 1 *</label>
                    <Field 
                      type="text" 
                      name="imei1" 
                      placeholder="۱۵ رقم IMEI"
                      style={{
                        ...styles.input,
                        ...(errors.imei1 && touched.imei1 ? styles.inputError : {}),
                        ...(touched.imei1 && !errors.imei1 ? { borderColor: '#10b981' } : {})
                      }}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                    />
                    <ErrorMessage name="imei1">
                      {msg => <div style={styles.errorText}>⚠️ {msg}</div>}
                    </ErrorMessage>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>IMEI 2 (اختیاری)</label>
                    <Field 
                      type="text" 
                      name="imei2" 
                      placeholder="۱۵ رقم IMEI"
                      style={styles.input}
                    />
                    <ErrorMessage name="imei2">
                      {msg => <div style={styles.errorText}>⚠️ {msg}</div>}
                    </ErrorMessage>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>برند *</label>
                    <Field 
                      as="select" 
                      name="brand"
                      style={{
                        ...styles.select,
                        ...(errors.brand && touched.brand ? styles.inputError : {})
                      }}
                    >
                      <option value="">انتخاب برند</option>
                      <option value="Apple">🍎 اپل</option>
                      <option value="Samsung">📱 سامسونگ</option>
                      <option value="Xiaomi">🔴 شیائومی</option>
                      <option value="Huawei">🇨🇳 هوآوی</option>
                      <option value="Nokia">📞 نوکیا</option>
                      <option value="Other">📲 سایر</option>
                    </Field>
                    <ErrorMessage name="brand">
                      {msg => <div style={styles.errorText}>⚠️ {msg}</div>}
                    </ErrorMessage>
                  </div>
                </div>
              </div>

              {/* بخش اطلاعات فروشنده */}
              <div style={styles.formSection}>
                <h3 style={styles.sectionTitle}>
                  <icons.User />
                  اطلاعات فروشنده
                </h3>
                
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>نام فروشنده *</label>
                    <Field 
                      type="text" 
                      name="sellerName" 
                      placeholder="نام کامل فروشنده"
                      style={{
                        ...styles.input,
                        ...(errors.sellerName && touched.sellerName ? styles.inputError : {})
                      }}
                    />
                    <ErrorMessage name="sellerName">
                      {msg => <div style={styles.errorText}>⚠️ {msg}</div>}
                    </ErrorMessage>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>نام پدر *</label>
                    <Field 
                      type="text" 
                      name="fatherName" 
                      placeholder="نام پدر فروشنده"
                      style={{
                        ...styles.input,
                        ...(errors.fatherName && touched.fatherName ? styles.inputError : {})
                      }}
                    />
                    <ErrorMessage name="fatherName">
                      {msg => <div style={styles.errorText}>⚠️ {msg}</div>}
                    </ErrorMessage>
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <icons.Phone />
                      شماره تماس فروشنده *
                    </label>
                    <Field 
                      type="text" 
                      name="sellerPhone" 
                      placeholder="0799123456"
                      style={{
                        ...styles.input,
                        ...(errors.sellerPhone && touched.sellerPhone ? styles.inputError : {})
                      }}
                    />
                    <ErrorMessage name="sellerPhone">
                      {msg => <div style={styles.errorText}>⚠️ {msg}</div>}
                    </ErrorMessage>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <icons.MapMarker />
                      آختصاصی *
                    </label>
                    <Field 
                      as="textarea" 
                      name="address" 
                      rows="3"
                      placeholder="آدرس کامل فروشنده"
                      style={{
                        ...styles.textarea,
                        ...(errors.address && touched.address ? styles.inputError : {})
                      }}
                    />
                    <ErrorMessage name="address">
                      {msg => <div style={styles.errorText}>⚠️ {msg}</div>}
                    </ErrorMessage>
                  </div>
                </div>
              </div>

              {/* بخش مدارک */}
              <div style={styles.formSection}>
                <h3 style={styles.sectionTitle}>
                  <icons.Camera />
                  مدارک فروشنده
                </h3>
                
                <div style={styles.formRow}>
                  <FileUpload 
                    field="sellerPhoto"
                    label="عکس فروشنده"
                    icon={<icons.User />}
                  />
                  
                  <FileUpload 
                    field="tazkiraPhoto"
                    label="عکس تذکره"
                    icon={<icons.IdCard />}
                  />
                  
                  <FileUpload 
                    field="thumbPhoto"
                    label="عکس انگشت شست"
                    icon={<icons.User />}
                  />
                </div>
              </div>

              {/* اطلاعات اضافی */}
              <div style={styles.formSection}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>اطلاعات اضافی</label>
                  <Field 
                    as="textarea" 
                    name="additionalInfo" 
                    rows="4"
                    placeholder="یادداشت‌ها، توضیحات اضافی، وضعیت موبایل و ..."
                    style={styles.textarea}
                  />
                </div>
              </div>

              {/* دکمه‌های اقدام */}
              <div style={styles.formActions}>
                <button 
                  type="button" 
                  style={styles.btnCancel}
                  onClick={() => navigate('/mobiles')}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
                >
                  ❌ انصراف
                </button>
                <button 
                  type="submit" 
                  style={{
                    ...styles.btnSubmit,
                    ...((isSubmitting || uploading) ? styles.btnDisabled : {})
                  }}
                  disabled={isSubmitting || uploading}
                  onMouseEnter={(e) => {
                    if (!isSubmitting && !uploading) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {uploading ? (
                    <>
                      در حال آپلود...
                      <span style={styles.loadingSpinner}></span>
                    </>
                  ) : isSubmitting ? (
                    <>
                      در حال ثبت...
                      <span style={styles.loadingSpinner}></span>
                    </>
                  ) : (
                    '✅ ثبت موبایل'
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>

      {/* استایل‌های اضافی */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        input:focus, select:focus, textarea:focus {
          outline: none;
        }
        
        .file-upload-area:hover {
          border-color: #667eea !important;
          background: #f0f4ff !important;
        }
        
        button:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr !important;
          }
          
          .form-actions {
            flex-direction: column;
          }
          
          .btn-cancel, .btn-submit {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AddMobile;