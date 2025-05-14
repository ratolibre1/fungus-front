import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function NotFound() {
  return (
    <Layout>
      <div className="container py-5">
        <div className="text-center mt-5">
          <h1 className="display-1 fw-bold" style={{ color: '#099347' }}>404</h1>
          <p className="fs-3">
            <span className="text-danger">¡Ups!</span> Página no encontrada.
          </p>
          <p className="lead">
            La página que estás buscando no existe o no tienes permisos para acceder.
          </p>
          <Link to="/panel" className="btn" style={{ backgroundColor: '#099347', color: 'white' }}>
            Volver al panel
          </Link>
        </div>
      </div>
    </Layout>
  );
} 