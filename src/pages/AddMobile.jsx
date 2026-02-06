import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { 
  FaMobileAlt, 
  FaUser, 
  FaIdCard, 
  FaPhone, 
  FaMapMarkerAlt,
  FaCamera,
  FaUpload
} from 'react-icons/fa';
import { mobileService } from '../services/mobileService';

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
    .matches(/^09[0-9]{9}$/, 'شماره تماس معتبر نیست'),
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
    setFiles(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setUploading(true);
      
      const mobileData = {
        ...values,
        sellerPhoto: files.sellerPhoto,
        tazkiraPhoto: files.tazkiraPhoto,
        thumbPhoto: files.thumbPhoto,
      };
      
      await mobileService.createMobile(mobileData);
      
      toast.success('موبایل با موفقیت ثبت شد');
      resetForm();
      setFiles({
        sellerPhoto: null,
        tazkiraPhoto: null,
        thumbPhoto: null,
      });
      
      navigate('/mobiles');
    } catch (error) {
      console.error('Error adding mobile:', error);
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  };

  const FileUpload = ({ field, label, icon }) => (
    <div className="file-upload">
      <label>
        {icon}
        {label}
      </label>
      <div className="file-upload-area">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(field, e.target.files[0])}
          className="file-input"
        />
        <div className="upload-content">
          <FaUpload />
          <p>{files[field]?.name || 'فایل را انتخاب کنید'}</p>
          <span>حداکثر ۵ مگابایت</span>
        </div>
      </div>
      {files[field] && (
        <div className="file-preview">
          <img 
            src={URL.createObjectURL(files[field])} 
            alt="پیش‌نمایش" 
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="add-mobile-page">
      <div className="page-header">
        <h1>
          <FaMobileAlt />
          ثبت موبایل جدید
        </h1>
        <p>اطلاعات موبایل و فروشنده را وارد کنید</p>
      </div>

      <div className="form-container">
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
          {({ errors, touched, isSubmitting }) => (
            <Form className="mobile-form">
              <div className="form-section">
                <h3>
                  <FaMobileAlt />
                  اطلاعات موبایل
                </h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>IMEI 1 *</label>
                    <Field 
                      type="text" 
                      name="imei1" 
                      placeholder="۱۵ رقم IMEI"
                      className={errors.imei1 && touched.imei1 ? 'error' : ''}
                    />
                    {errors.imei1 && touched.imei1 && (
                      <div className="error-message">{errors.imei1}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>IMEI 2</label>
                    <Field 
                      type="text" 
                      name="imei2" 
                      placeholder="۱۵ رقم IMEI (اختیاری)"
                    />
                  </div>

                  <div className="form-group">
                    <label>برند *</label>
                    <Field 
                      as="select" 
                      name="brand"
                      className={errors.brand && touched.brand ? 'error' : ''}
                    >
                      <option value="">انتخاب کنید</option>
                      <option value="Apple">اپل</option>
                      <option value="Samsung">سامسونگ</option>
                      <option value="Xiaomi">شیائومی</option>
                      <option value="Huawei">هوآوی</option>
                      <option value="Nokia">نوکیا</option>
                      <option value="Other">سایر</option>
                    </Field>
                    {errors.brand && touched.brand && (
                      <div className="error-message">{errors.brand}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>
                  <FaUser />
                  اطلاعات فروشنده
                </h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>نام فروشنده *</label>
                    <Field 
                      type="text" 
                      name="sellerName" 
                      placeholder="نام کامل"
                      className={errors.sellerName && touched.sellerName ? 'error' : ''}
                    />
                    {errors.sellerName && touched.sellerName && (
                      <div className="error-message">{errors.sellerName}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>نام پدر *</label>
                    <Field 
                      type="text" 
                      name="fatherName" 
                      placeholder="نام پدر"
                      className={errors.fatherName && touched.fatherName ? 'error' : ''}
                    />
                    {errors.fatherName && touched.fatherName && (
                      <div className="error-message">{errors.fatherName}</div>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <FaPhone />
                      شماره تماس فروشنده *
                    </label>
                    <Field 
                      type="text" 
                      name="sellerPhone" 
                      placeholder="09xxxxxxxxx"
                      className={errors.sellerPhone && touched.sellerPhone ? 'error' : ''}
                    />
                    {errors.sellerPhone && touched.sellerPhone && (
                      <div className="error-message">{errors.sellerPhone}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>
                      <FaMapMarkerAlt />
                      آدرس *
                    </label>
                    <Field 
                      as="textarea" 
                      name="address" 
                      rows="3"
                      placeholder="آدرس کامل"
                      className={errors.address && touched.address ? 'error' : ''}
                    />
                    {errors.address && touched.address && (
                      <div className="error-message">{errors.address}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>
                  <FaCamera />
                  مدارک فروشنده
                </h3>
                
                <div className="file-uploads">
                  <FileUpload 
                    field="sellerPhoto"
                    label="عکس فروشنده"
                    icon={<FaUser />}
                  />
                  
                  <FileUpload 
                    field="tazkiraPhoto"
                    label="عکس تذکره"
                    icon={<FaIdCard />}
                  />
                  
                  <FileUpload 
                    field="thumbPhoto"
                    label="عکس نشان شست"
                    icon={<FaUser />}
                  />
                </div>
              </div>

              <div className="form-section">
                <div className="form-group">
                  <label>اطلاعات اضافی</label>
                  <Field 
                    as="textarea" 
                    name="additionalInfo" 
                    rows="4"
                    placeholder="یادداشت‌ها و توضیحات اضافی..."
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => navigate('/mobiles')}
                >
                  انصراف
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={isSubmitting || uploading}
                >
                  {uploading ? 'در حال آپلود...' : 'ثبت موبایل'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AddMobile;