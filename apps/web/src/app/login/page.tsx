'use client';
import AuthModal from '@/components/auth/AuthModal';

export default function LoginPage() {
  return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '40px 20px' }}>
      <AuthModal isOpen={true} onClose={() => {}} inline={true} />
    </div>
  );
}
