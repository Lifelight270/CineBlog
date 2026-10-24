import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BorderBeam } from '@/components/magicui/border-beam';

export default function Auth({ mode }) {
  const isRegister = mode === 'register';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = isRegister ? await register(form) : await login({ email: form.email, password: form.password });
      toast.success(`Welcome, ${user.name.split(' ')[0]}.`);
      navigate(state?.from || (user.role === 'admin' ? '/dashboard' : '/'), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="relative z-10 grid min-h-screen place-items-center px-5 py-32">
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="glass relative w-full max-w-md rounded-[2rem] p-8 sm:p-10">
        <h1 className="text-4xl font-semibold">{isRegister ? 'Create your account' : 'Welcome back'}</h1>
        <p className="mt-2 text-ink/70">{isRegister ? 'Like articles and join the conversation.' : 'Sign in to like and comment on articles.'}</p>

        <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
          {isRegister && (
            <div><Label htmlFor="name">Name</Label><Input id="name" value={form.name} onChange={set('name')} required autoComplete="name" /></div>
          )}
          <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={form.email} onChange={set('email')} required autoComplete="email" /></div>
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input id="password" type={show ? 'text' : 'password'} value={form.password} onChange={set('password')} required minLength={6} autoComplete={isRegister ? 'new-password' : 'current-password'} className="pr-12" />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? 'Hide password' : 'Show password'}
                aria-pressed={show}
                className="absolute right-2 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-ink/60 transition-colors hover:bg-ink/10 hover:text-ink"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && <p role="alert" className="rounded-xl bg-red-500/15 px-4 py-3 text-base text-red-300">{error}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}</Button>
        </form>

        <p className="mt-6 text-center text-ink/70">
          {isRegister ? 'Already have an account?' : 'New here?'}{' '}
          <Link className="font-semibold text-accent underline underline-offset-4" to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link>
        </p>
        <BorderBeam duration={12} />
      </motion.div>
    </main>
  );
}
