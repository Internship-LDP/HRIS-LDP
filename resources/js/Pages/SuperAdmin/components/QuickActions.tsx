import React from "react";
import { Users, Briefcase, Layers, Mail, UserCog, MessageSquare } from "lucide-react";
import { Link } from "@inertiajs/react";

const QuickActions: React.FC = () => {
  const actions = [
    {
      name: "Kelola Akun",
      icon: <Users className="w-4 h-4 mr-2" />,
      href: "/super-admin/accounts",
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      name: "Kelola Rekruitmen",
      icon: <Briefcase className="w-4 h-4 mr-2" />,
      href: "/super-admin/recruitment",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      name: "Kelola Divisi",
      icon: <Layers className="w-4 h-4 mr-2" />,
      href: "/super-admin/kelola-divisi",
      color: "bg-cyan-600 hover:bg-cyan-700",
    },
    {
      name: "Kelola Surat",
      icon: <Mail className="w-4 h-4 mr-2" />,
      href: "/super-admin/kelola-surat",
      color: "bg-indigo-600 hover:bg-indigo-700",
    },
    {
      name: "Kelola Staff",
      icon: <UserCog className="w-4 h-4 mr-2" />,
      href: "/super-admin/kelola-staff",
      color: "bg-blue-800 hover:bg-blue-900",
    },
    {
      name: "Kelola Pengaduan",
      icon: <MessageSquare className="w-4 h-4 mr-2" />,
      href: "/super-admin/kelola-pengaduan",
      color: "bg-gray-700 hover:bg-gray-800",
    },
  ];

  return (
    <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-slate-200 shadow-md py-3 z-50">
      <div className="flex justify-center flex-wrap gap-3 px-6">
        {actions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className={`flex items-center text-white text-sm font-medium px-4 py-2 rounded-lg transition ${action.color}`}
          >
            {action.icon}
            {action.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
