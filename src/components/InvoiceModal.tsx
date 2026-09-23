import React from 'react';
import { X, Printer, CheckCircle, ShieldCheck } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    orderId: string;
    username: string;
    items: { name: string; price: number }[];
    totalAmount: number;
    paymentMethod: string;
    date: string;
  } | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, orderData }) => {
  if (!isOpen || !orderData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm dir-rtl">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl print:bg-white print:text-black print:border-none">
        
        <button
          onClick={onClose}
          className="absolute left-4 top-4 text-slate-400 hover:text-white transition-colors print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ترويسة الفاتورة */}
        <div className="border-b border-slate-800 pb-4 mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white print:text-black">فاتورة شراء - VortexMC</h2>
            <p className="text-slate-400 text-xs print:text-gray-600">رقم الطلب: #{orderData.orderId}</p>
          </div>
          <div className="text-left">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
              <CheckCircle className="w-3.5 h-3.5" /> مدفوع
            </span>
          </div>
        </div>

        {/* تفاصيل العميل */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-6 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 print:bg-gray-100 print:border-gray-200">
          <div>
            <span className="text-slate-400 text-xs block">حساب ماينكرافت:</span>
            <span className="font-semibold text-white print:text-black">{orderData.username}</span>
          </div>
          <div>
            <span className="text-slate-400 text-xs block">طريقة الدفع:</span>
            <span className="font-semibold text-white print:text-black">{orderData.paymentMethod}</span>
          </div>
          <div>
            <span className="text-slate-400 text-xs block">تاريخ العملية:</span>
            <span className="font-semibold text-white print:text-black">{orderData.date}</span>
          </div>
        </div>

        {/* عناصر المشتريات */}
        <div className="space-y-3 mb-6">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">العناصر المشتراة</h3>
          <div className="divide-y divide-slate-800 border-t border-b border-slate-800 py-2">
            {orderData.items.map((item, idx) => (
              <div key={idx} className="flex justify-between py-2 text-sm">
                <span className="text-slate-200 font-medium print:text-black">{item.name}</span>
                <span className="text-slate-300 font-bold print:text-black">${item.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* إجمالي المبلغ */}
        <div className="flex justify-between items-center p-4 bg-purple-600/10 border border-purple-500/20 rounded-xl mb-6">
          <span className="font-bold text-white print:text-black">المبلغ الإجمالي</span>
          <span className="text-xl font-extrabold text-purple-400 print:text-purple-700">${orderData.totalAmount} USD</span>
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Printer className="w-4 h-4" /> طباعة / حفظ PDF
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};