import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCurrentLocation } from '../utils/helpers';
import { Logo } from '../components/Logo';

export function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    latitude: null,
    longitude: null,
  });
  const [locationStatus, setLocationStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [useManualLocation, setUseManualLocation] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Request geolocation on component mount
  const handleRequestLocation = async () => {
    setLocationStatus('Requesting location...');
    try {
      const { latitude, longitude } = await getCurrentLocation();
      setFormData((prev) => ({
        ...prev,
        latitude,
        longitude,
      }));
      setLocationStatus(`✓ Location saved (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
    } catch (err) {
      setLocationStatus('❌ Location denied. You can enter it manually below.');
      setUseManualLocation(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate
    if (!formData.name || !formData.email || !formData.password) {
      setError('Name, email, and password are required');
      return;
    }

    if (formData.latitude === null || formData.longitude === null) {
      setError('Location is required. Please enable geolocation or enter manually.');
      return;
    }

    setLoading(true);

    const result = await signup(
      formData.name,
      formData.email,
      formData.password,
      formData.latitude,
      formData.longitude
    );

    if (result.success) {
      navigate('/browse');
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[FDE68A] px-4 py-8">
      <div className="card w-full max-w-md p-8 animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Logo className="h-10 w-10" />
            <h1 className="text-2xl font-extrabold text-gray-900">
              Lend<span className="text-accent-500">Nest</span>
            </h1>
          </div>
          <p className="text-gray-600">Join the LendNest community</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Location Status */}
        <div className="mb-6 p-4 bg-black border border-black rounded-lg">
          <p className="text-sm text-gray-200 mb-3">
            📍 <strong className="text-accent-500">Why we need your location:</strong> To help borrowers find you and lenders near you!
          </p>
          {!locationStatus && (
            <button
              type="button"
              onClick={handleRequestLocation}
              className="w-full px-4 py-2 bg-accent-500 text-black rounded-lg font-bold hover:bg-accent-400 hover:scale-105 transition-all duration-200"
            >
              📍 Enable Location Access
            </button>
          )}
          {locationStatus && (
            <p className="text-sm font-medium text-white">{locationStatus}</p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="input-field"
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="input-field"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              className="input-field"
              placeholder="••••••••"
            />
          </div>

          {/* Manual Location Entry */}
          {useManualLocation && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  name="latitude"
                  step="0.0001"
                  value={formData.latitude || ''}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="40.7128"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  name="longitude"
                  step="0.0001"
                  value={formData.longitude || ''}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="-74.0060"
                />
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-accent-500 text-black rounded-lg font-bold hover:bg-accent-400 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-black font-bold hover:text-accent-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}