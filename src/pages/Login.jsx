import LoginFooter from "../features/auth/components/LoginFooter.jsx";
import LoginForm from "../features/auth/components/LoginForm.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx";

export default function Login() {
  return (
    <AuthLayout>
      <LoginForm />
      <LoginFooter />
    </AuthLayout>
  );
}
