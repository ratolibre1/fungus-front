import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoGreen from '../assets/images/logo-green.png';

export default function ForcePasswordChange() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Verificar que hay un token válido, si no redirigir al login
  useEffect(() => {
    const token = localStorage.getItem('fungus_token');
    if (!token) {
      navigate('/iniciar-sesion');
    }
  }, [navigate]);

  // Validación de contraseña
  const isPasswordValid = (password: string): boolean => {
    return password.length >= 6;
  };

  // Comprobar si la contraseña es válida y coincide con la confirmación
  const passwordsMatch = newPassword === confirmPassword;
  const isValidPassword = isPasswordValid(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica
    if (!isValidPassword) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!passwordsMatch) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    setError(null);

    const token = localStorage.getItem('fungus_token');
    if (!token) {
      setError('La sesión ha expirado. Por favor, vuelve a iniciar sesión.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cambiar la contraseña');
      }

      // Mostrar mensaje de éxito y redirigir después de un breve retraso
      setSuccess(true);
      setTimeout(() => {
        navigate('/panel');
      }, 2000);

    } catch (err) {
      console.error('Error durante el cambio de contraseña:', err);
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
                <h2 className="text-center fs-5 mb-2 font-body" style={{ color: '#6c757d' }}>
                  Cambio de Contraseña Requerido
                </h2>

                <p className="text-center mb-4" style={{ color: '#6c757d' }}>
                  Por seguridad, debes cambiar tu contraseña por defecto antes de continuar.
                </p>

                {error && (
                  <div className="alert text-white" style={{ backgroundColor: '#dc3545' }} role="alert">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="alert text-white" style={{ backgroundColor: '#099347' }} role="alert">
                    ¡Contraseña actualizada correctamente! Redirigiendo...
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">
                      Nueva Contraseña
                    </label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`form-control ${newPassword && !isValidPassword ? 'is-invalid' : ''}`}
                      placeholder="Mínimo 6 caracteres"
                    />
                    {newPassword && !isValidPassword && (
                      <div className="invalid-feedback">
                        La contraseña debe tener al menos 6 caracteres
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirmar Contraseña
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`form-control ${confirmPassword && !passwordsMatch ? 'is-invalid' : ''}`}
                      placeholder="Repite tu nueva contraseña"
                    />
                    {confirmPassword && !passwordsMatch && (
                      <div className="invalid-feedback">
                        Las contraseñas no coinciden
                      </div>
                    )}
                  </div>

                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn"
                      style={{ backgroundColor: '#099347', color: 'white' }}
                      disabled={loading || !isValidPassword || !passwordsMatch}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Procesando...
                        </>
                      ) : (
                        'Cambiar Contraseña'
                      )}
                    </button>
                  </div>

                  <div className="mt-3">
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className={`progress-bar ${newPassword.length >= 6 ? 'bg-success' : 'bg-danger'}`}
                        role="progressbar"
                        style={{
                          width: `${Math.min(newPassword.length * 16, 100)}%`,
                          backgroundColor: newPassword.length >= 6 ? '#099347' : undefined
                        }}
                        aria-valuenow={Math.min(newPassword.length * 16, 100)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      ></div>
                    </div>
                    <small className="text-muted">
                      Seguridad de la contraseña: {newPassword.length === 0 ? 'No ingresada' :
                        newPassword.length < 6 ? 'Débil' :
                          newPassword.length < 10 ? 'Moderada' : 'Fuerte'}
                    </small>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 