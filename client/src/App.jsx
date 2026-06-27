import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { FarmProvider } from './context/FarmContext';
import { SocketProvider } from './context/SocketContext';
import AppRouter from './router/AppRouter';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <FarmProvider>
            <AppRouter />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: '12px',
                  background: '#1F2937',
                  color: '#fff',
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: '600',
                  fontSize: '14px',
                  padding: '12px 16px',
                },
                success: {
                  iconTheme: {
                    primary: '#52B788',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#DC2626',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </FarmProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
