import { useEffect, useState } from 'react';
import Layout from '../components/Layout';

export default function Purchases() {
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Solo para demostración - simular carga
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout>
      <div className="container">
        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
          <h1 className="h2 font-heading" style={{ color: '#099347' }}>Compras a Proveedores</h1>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center my-5">
            <div className="spinner-border" style={{ color: '#099347' }} role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : (
          <div className="alert alert-info" role="alert">
            Módulo de compras a proveedores en desarrollo.
          </div>
        )}
      </div>
    </Layout>
  );
} 