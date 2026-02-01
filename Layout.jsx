import { Link } from 'wasp/client/router';
import { useAuth, logout } from 'wasp/client/auth';
import './Main.css';

export function Layout({ children }) {
  const { data: user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-bold hover:text-blue-100">
                BeshGebeya Tracker
              </Link>
              
              {user && (
                <div className="hidden md:flex space-x-4">
                  <Link 
                    to="/" 
                    className="px-3 py-2 rounded-md hover:bg-blue-700 transition"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/products" 
                    className="px-3 py-2 rounded-md hover:bg-blue-700 transition"
                  >
                    Products
                  </Link>
                  <Link 
                    to="/inventory" 
                    className="px-3 py-2 rounded-md hover:bg-blue-700 transition"
                  >
                    Inventory
                  </Link>
                  <Link 
                    to="/sales" 
                    className="px-3 py-2 rounded-md hover:bg-blue-700 transition"
                  >
                    Sales
                  </Link>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm">
                    Welcome, <span className="font-semibold">{user.name || user.username}</span>
                  </span>
                  <button
                    onClick={logout}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-md transition text-sm font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-md transition text-sm font-medium"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            © 2024 BeshGebeya Tracker - Fresh Market Inventory Management
          </p>
        </div>
      </footer>
    </div>
  );
}
