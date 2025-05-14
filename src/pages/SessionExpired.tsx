import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import logoGreen from '../assets/images/logo-green.png';

export default function SessionExpired() {
  const [countdown, setCountdown] = useState(5);
  const [redirect, setRedirect] = useState(false);

  // Limpiar el almacenamiento local al entrar a esta página
  useEffect(() => {
    localStorage.removeItem('fungus_token');
    localStorage.removeItem('fungus_user');

    // Iniciar la cuenta regresiva
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(timer);
          setRedirect(true);
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (redirect) {
    return <Navigate to="/iniciar-sesion" replace />;
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: '#f8f9fa' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-sm p-4 text-center">
              <div className="mb-4">
                <img
                  src={logoGreen}
                  alt="Fungus Mycelium Logo"
                  className="img-fluid mb-3"
                  style={{ maxWidth: '150px' }}
                />
                <h1 className="fs-2 text-center font-appname" style={{ color: '#099347' }}>
                  Fungus Mycelium
                </h1>
              </div>

              <div className="card-body">
                <h2 className="fs-4 mb-3" style={{ color: '#dc3545' }}>
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Sesión expirada
                </h2>
                <p>
                  Tu sesión ha expirado por motivos de seguridad.
                  Por favor, inicia sesión nuevamente para continuar.
                </p>
                <p className="fs-5 mt-4">
                  Serás redirigido en <span className="badge bg-secondary">{countdown}</span> {countdown === 1 ? 'segundo' : 'segundos'}...
                </p>
                <div className="mt-3">
                  <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                    <span className="visually-hidden">Redirigiendo...</span>
                  </div>
                  <span className="text-muted">Redirigiendo al login</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 