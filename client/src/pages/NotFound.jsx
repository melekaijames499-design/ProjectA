import React from 'react';
import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-mintBg flex items-center justify-center p-4">
      <div className="text-center">
        <SearchX className="h-24 w-24 text-primary/30 mx-auto mb-6" />
        <h1 className="text-6xl font-black font-outfit text-textPrimary mb-4">404</h1>
        <p className="text-xl text-textMuted font-bold mb-8">Page not found</p>
        <Link
          to="/"
          className="inline-block bg-white text-textPrimary ring-1 ring-gray-200 hover:bg-mintBg hover:text-primary font-bold py-3 px-8 rounded-xl transition-all shadow-sm"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
