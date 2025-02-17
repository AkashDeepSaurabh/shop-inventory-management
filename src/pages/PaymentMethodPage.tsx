import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';

const PaymentMethodPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { paymentMethod: initialPaymentMethod, paymentDetails: initialPaymentDetails } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState<string>(initialPaymentMethod || '');
  const [paymentDetails, setPaymentDetails] = useState({
    cash: initialPaymentDetails?.cash || 0,
    upi: initialPaymentDetails?.upi || '',
    debitCard: initialPaymentDetails?.debitCard || '',
    creditCard: initialPaymentDetails?.creditCard || '',
    other: initialPaymentDetails?.other || ''
  });
  const [errors, setErrors] = useState({
    cash: '',
    upi: '',
    debitCard: '',
    creditCard: '',
    other: ''
  });

  const handlePaymentMethodChange = (selectedOption: any) => {
    setPaymentMethod(selectedOption?.value || '');
  };

  const handlePaymentDetailsChange = (field: string, value: string | number) => {
    setPaymentDetails((prevDetails) => ({
      ...prevDetails,
      [field]: value,
    }));
  };

  const validateForm = () => {
    let valid = true;
    let newErrors = {
      cash: '',
      upi: '',
      debitCard: '',
      creditCard: '',
      other: '',
    };

    if (paymentMethod === 'cash') {
      if (paymentDetails.cash <= 0) {
        newErrors.cash = 'Cash amount must be greater than 0';
        valid = false;
      }
    } else if (paymentMethod === 'upi') {
      if (!paymentDetails.upi.trim()) {
        newErrors.upi = 'UPI ID is required';
        valid = false;
      }
    } else if (paymentMethod === 'debitCard') {
      if (!paymentDetails.debitCard.trim()) {
        newErrors.debitCard = 'Debit card number is required';
        valid = false;
      }
    } else if (paymentMethod === 'creditCard') {
      if (!paymentDetails.creditCard.trim()) {
        newErrors.creditCard = 'Credit card number is required';
        valid = false;
      }
    } else if (paymentMethod === 'other') {
      if (!paymentDetails.other.trim()) {
        newErrors.other = 'Other payment details are required';
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = () => {
    // Validate form before navigating
    if (validateForm()) {
      // Return payment data to the SalesPage or continue to print-bill page
      navigate('/print-bill', {
        state: {
          paymentMethod,
          paymentDetails,
        },
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-xl">
      <h1 className="text-3xl font-semibold text-gray-900 mb-6">Payment Method</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Payment Method</label>
          <Select
            options={[
              { value: 'cash', label: 'Cash' },
              { value: 'upi', label: 'UPI' },
              { value: 'debitCard', label: 'Debit Card' },
              { value: 'creditCard', label: 'Credit Card' },
              { value: 'other', label: 'Other' },
            ]}
            onChange={handlePaymentMethodChange}
            value={paymentMethod ? { label: paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1), value: paymentMethod } : null}
            className="w-full"
          />
          {errors.cash && <p className="text-red-500 text-xs mt-1">{errors.cash}</p>}
          {errors.upi && <p className="text-red-500 text-xs mt-1">{errors.upi}</p>}
          {errors.debitCard && <p className="text-red-500 text-xs mt-1">{errors.debitCard}</p>}
          {errors.creditCard && <p className="text-red-500 text-xs mt-1">{errors.creditCard}</p>}
          {errors.other && <p className="text-red-500 text-xs mt-1">{errors.other}</p>}
        </div>

        {paymentMethod && (
          <>
            {paymentMethod === 'cash' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Cash Amount</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-md"
                  value={paymentDetails.cash}
                  onChange={(e) => handlePaymentDetailsChange('cash', parseFloat(e.target.value))}
                  placeholder="Enter cash amount"
                />
                {errors.cash && <p className="text-red-500 text-xs mt-1">{errors.cash}</p>}
              </div>
            )}

            {paymentMethod === 'upi' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">UPI ID</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={paymentDetails.upi}
                  onChange={(e) => handlePaymentDetailsChange('upi', e.target.value)}
                  placeholder="Enter UPI ID"
                />
                {errors.upi && <p className="text-red-500 text-xs mt-1">{errors.upi}</p>}
              </div>
            )}

            {paymentMethod === 'debitCard' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Debit Card Number</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={paymentDetails.debitCard}
                  onChange={(e) => handlePaymentDetailsChange('debitCard', e.target.value)}
                  placeholder="Enter debit card number"
                />
                {errors.debitCard && <p className="text-red-500 text-xs mt-1">{errors.debitCard}</p>}
              </div>
            )}

            {paymentMethod === 'creditCard' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Credit Card Number</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={paymentDetails.creditCard}
                  onChange={(e) => handlePaymentDetailsChange('creditCard', e.target.value)}
                  placeholder="Enter credit card number"
                />
                {errors.creditCard && <p className="text-red-500 text-xs mt-1">{errors.creditCard}</p>}
              </div>
            )}

            {paymentMethod === 'other' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Other Payment Details</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={paymentDetails.other}
                  onChange={(e) => handlePaymentDetailsChange('other', e.target.value)}
                  placeholder="Enter other payment details"
                />
                {errors.other && <p className="text-red-500 text-xs mt-1">{errors.other}</p>}
              </div>
            )}
          </>
        )}

        <div className="mt-6">
          <button
            onClick={handleSubmit}
            disabled={!paymentMethod || Object.values(errors).some((error) => error)}
            className={`px-6 py-2 text-sm font-medium text-white ${(!paymentMethod || Object.values(errors).some((error) => error)) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} rounded-lg`}
          >
            Proceed to Complete Sale
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodPage;
