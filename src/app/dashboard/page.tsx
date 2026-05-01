import React from "react";
import { CheckCircle, Clock, XCircle, Search } from "lucide-react";

export default function DashboardOrders() {
  const mockOrders = [
    { id: "ORD-001", name: "Ahmed Al-Faisal", company: "Saudi Aramco", date: "2026-05-10", size: 45, status: "pending" },
    { id: "ORD-002", name: "Sarah Smith", company: "Private Group", date: "2026-05-15", size: 12, status: "confirmed" },
    { id: "ORD-003", name: "Mohammed Ali", company: "STC", date: "2026-05-20", size: 80, status: "cancelled" },
    { id: "ORD-004", name: "Emma Johnson", company: "Tech Solutions", date: "2026-06-05", size: 25, status: "pending" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 p-6 rounded-2xl shadow-sm border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm font-medium mb-1">Total Orders</p>
            <h3 className="text-3xl font-bold text-white">124</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
            <CheckCircle size={24} />
          </div>
        </div>
        <div className="bg-white/5 p-6 rounded-2xl shadow-sm border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm font-medium mb-1">Pending Inquiries</p>
            <h3 className="text-3xl font-bold text-white">12</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock size={24} />
          </div>
        </div>
        <div className="bg-white/5 p-6 rounded-2xl shadow-sm border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm font-medium mb-1">Revenue (This Month)</p>
            <h3 className="text-3xl font-bold text-white">SAR 450k</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle size={24} />
          </div>
        </div>
      </div>

      {/* Orders Table Area */}
      <div className="bg-white/5 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-white">Recent Orders & Inquiries</h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input 
              type="text" 
              placeholder="Search orders..." 
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cba135] focus:border-transparent placeholder:text-white/40"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-white/60 text-sm font-medium">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Client Name</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Group Size</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {mockOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{order.id}</td>
                  <td className="px-6 py-4 text-white/80">{order.name}</td>
                  <td className="px-6 py-4 text-white/60">{order.company}</td>
                  <td className="px-6 py-4 text-white/80">{order.date}</td>
                  <td className="px-6 py-4 text-white/80">{order.size} pax</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' :
                      order.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-[#d4b458] hover:text-[#cba135] font-medium text-sm">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-white/10 bg-white/5 text-center">
          <button className="text-white/60 hover:text-white text-sm font-medium transition-colors">View All Orders</button>
        </div>
      </div>
    </div>
  );
}
