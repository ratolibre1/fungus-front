import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoGreen from '../assets/images/logo-green.png';

interface LoginResponse {
  success: boolean;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  token: string;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.success === false ? 'Credenciales inválidas' : 'Error al iniciar sesión');
      }

      // Guardar token en localStorage
      localStorage.setItem('fungus_token', data.token);
      localStorage.setItem('fungus_user', JSON.stringify(data.user));

      // Redirigir al panel
      navigate('/panel');

    } catch (err) {
      console.error('Error durante login:', err);
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5 col-xl-4">
            <div className="text-center mb-4">
              <img
                src={logoGreen}
                alt="Fungus Mycelium Logo"
                className="img-fluid mb-3"
                style={{ maxWidth: '180px' }}
              />
              <h1 className="fs-1 text-center mb-2 font-appname" style={{ color: '#099347' }}>
                Fungus Mycelium
              </h1>
            </div>

            <div className="card shadow-sm p-4">
              <div className="card-body">
                <h2 className="text-center fs-5 mb-4 font-body" style={{ color: '#6c757d' }}>
                  Inicia sesión en tu cuenta
                </h2>

                {error && (
                  <div className="alert text-white" style={{ backgroundColor: '#dc3545' }} role="alert">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-control"
                      placeholder="tu.email@ejemplo.com"
                    />
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label htmlFor="password" className="form-label mb-0">
                        Contraseña
                      </label>
                      <a href="#" style={{ color: '#099347', textDecoration: 'none' }} className="small">
                        ¿Olvidaste tu contraseña?
                      </a>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-control"
                      placeholder="Ingresa tu contraseña"
                    />
                  </div>

                  <div className="d-grid gap-2 mt-4">
                    <button
                      type="submit"
                      className="btn"
                      style={{ backgroundColor: '#099347', color: 'white' }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Cargando...
                        </>
                      ) : (
                        'Iniciar sesión'
                      )}
                    </button>
                  </div>
                </form>

                <p className="mt-4 text-center small" style={{ color: '#6c757d' }}>
                  ¿No tienes una cuenta?{' '}
                  <a href="#" style={{ color: '#099347', textDecoration: 'none' }}>
                    Regístrate ahora
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 