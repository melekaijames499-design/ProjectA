import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-mintBg flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl ring-1 ring-secondary/20 p-10 max-w-md text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
          <ShieldAlert className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-black font-outfit text-textPrimary mb-3">Access Denied</h1>
        <p className="text-textMuted font-medium mb-8">
          You do not have permission to view this page. If you believe this is a mistake, please contact your administrator.
        </p>
        <Link
          to="/"
          className="inline-block bg-primary hover:bg-primary-light text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
