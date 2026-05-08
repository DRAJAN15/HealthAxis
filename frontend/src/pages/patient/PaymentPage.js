import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentAPI, appointmentAPI } from '../../services/api';
import { PageHeader, Spinner } from '../../components/common';
import { FiShield, FiCreditCard, FiCheck } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function PaymentPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [paying, setPaying]     = useState(false);
  const [paid, setPaid]         = useState(false);

  useEffect(() => {
    appointmentAPI.getOne(appointmentId)
      .then(r => {
        const apt = r.data.data;
        setAppointment(apt);
        if (apt.isPaid) setPaid(true);
      })
      .finally(() => setLoading(false));
  }, [appointmentId]);

  const loadRazorpay = () => new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handlePayment = async () => {
    setPaying(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { toast.error('Failed to load Razorpay. Check your connection.'); return; }

      // Create order on backend
      const { data } = await paymentAPI.createOrder({ appointmentId });
      const { orderId, amount, currency, keyId, prefill } = data.data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'Hospital Management System',
        description: `Consultation with Dr. ${appointment.doctor?.name}`,
        order_id: orderId,
        prefill: { name: prefill.name, email: prefill.email },
        theme: { color: '#0ea5e9' },
        handler: async (response) => {
          try {
            await paymentAPI.verifyPayment({
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success('Payment successful! 🎉');
            setPaid(true);
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        modal: { ondismiss: () => { setPaying(false); } },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        toast.error(`Payment failed: ${resp.error.description}`);
        setPaying(false);
      });
      rzp.open();
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (!appointment) return <div className="text-center py-16 text-gray-400">Appointment not found</div>;

  return (
    <div className="max-w-md mx-auto">
      <PageHeader title="Payment" subtitle="Complete your appointment booking" />

      {paid ? (
        /* Success state */
        <div className="card text-center py-12">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <FiCheck className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-500 mb-6">Your appointment has been confirmed. You'll receive a confirmation email shortly.</p>
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-left space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-500">Doctor</span>
              <span className="font-semibold">Dr. {appointment.doctor?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span className="font-semibold">{format(new Date(appointment.appointmentDate), 'dd MMM yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Time</span>
              <span className="font-semibold">{appointment.timeSlot?.startTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Amount Paid</span>
              <span className="font-bold text-green-600">₹{appointment.consultationFee}</span>
            </div>
          </div>
          <button onClick={() => navigate('/patient/appointments')} className="btn-primary w-full">
            View My Appointments
          </button>
        </div>
      ) : (
        /* Payment form */
        <div className="space-y-4">
          {/* Appointment Summary */}
          <div className="card">
            <h2 className="font-bold text-gray-800 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Doctor</span>
                <span className="font-semibold">Dr. {appointment.doctor?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-semibold">{format(new Date(appointment.appointmentDate), 'dd MMM yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time</span>
                <span className="font-semibold">{appointment.timeSlot?.startTime} – {appointment.timeSlot?.endTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span className="font-semibold capitalize">{appointment.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Reason</span>
                <span className="font-semibold max-w-[180px] text-right">{appointment.reason}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-bold text-gray-800">Total</span>
                <span className="font-bold text-lg text-sky-600">₹{appointment.consultationFee}</span>
              </div>
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
            <FiShield className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <p className="text-xs text-gray-500">
              Your payment is secured with 256-bit SSL encryption via Razorpay.
            </p>
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={paying}
            className="btn-primary w-full py-4 text-base flex items-center justify-center gap-3"
          >
            {paying ? (
              <><Spinner size="sm" /> Processing...</>
            ) : (
              <><FiCreditCard className="w-5 h-5" /> Pay ₹{appointment.consultationFee} Securely</>
            )}
          </button>

          <button
            onClick={() => navigate('/patient/appointments')}
            className="btn-secondary w-full text-sm"
          >
            Pay Later
          </button>

          <p className="text-center text-xs text-gray-400">
            Powered by Razorpay · UPI, Cards, Net Banking accepted
          </p>
        </div>
      )}
    </div>
  );
}
