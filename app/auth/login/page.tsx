import LoginForm from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 h-screen">
        <div className="hidden md:flex items-center justify-center bg-gray-100">
          <div className="p-8 text-center">
            <img src="/placeholder.svg" alt="Review Management" className="w-3/4 mx-auto mb-8"/>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Grow Easy</h1>
            <p className="text-gray-600">
              The all-in-one platform for managing your business reviews with the power of AI.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
