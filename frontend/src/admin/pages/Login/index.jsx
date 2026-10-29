import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Checkbox, PasswordInput, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconInfoCircle } from '@tabler/icons-react';
import { BinaryTicker, Button, FormAlert, Logo, NodeField } from '@/components/ui';
import { Seo } from '@/components/ui/Seo';
import { useAuth } from '../../auth/AuthContext';
import { FullPageLoader } from '../../auth/guards';
import { loginErrorMessage, mapFormError } from '../../lib/formErrors';
import { safeNextPath } from '../../lib/permissions';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export default function LoginPage() {
  const { status, login, sessionExpired } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const next = safeNextPath(params.get('next'));
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef(null);

  const form = useForm({
    initialValues: { email: '', password: '', remember: false },
    validate: {
      email: (value) => (EMAIL_PATTERN.test(value.trim()) ? null : 'Enter the email address you sign in with.'),
      password: (value) => (value ? null : 'Enter your password.'),
    },
  });

  // Land on the first field so keyboard users can type straight away.
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  if (status === 'loading') return <FullPageLoader label="Checking your session…" />;
  if (status === 'authenticated') return <Navigate to={next} replace />;

  const submit = async (values) => {
    setFormError('');
    setSubmitting(true);
    try {
      await login({ email: values.email.trim(), password: values.password, remember: values.remember });
      navigate(next, { replace: true });
    } catch (error) {
      const mapped = mapFormError(error);
      if (mapped.isValidation && mapped.fieldErrors.email && Object.keys(mapped.fieldErrors).length === 1) {
        // Laravel reports bad credentials as a 422 on `email`.
        setFormError('The email or password is incorrect.');
      } else if (mapped.isValidation) {
        form.setErrors(mapped.fieldErrors);
      } else {
        setFormError(loginErrorMessage(error));
      }
      form.setFieldValue('password', '');
      window.requestAnimationFrame(() => (document.getElementById('login-error') ?? document.querySelector('[aria-invalid="true"]'))?.focus());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login">
      <Seo title="Sign in" noindex />
      <aside className="admin-login__brand is-dark" aria-hidden="true">
        <NodeField seed="admin-login" nodes={26} packets={5} className="admin-login__art" />
        <div className="admin-login__brand-copy">
          <BinaryTicker />
        </div>
      </aside>

      <main className="admin-login__panel" id="admin-main">
        <div className="admin-login__card">
          <Logo to="/" />
          <p className="admin-login__eyebrow">Admin console</p>
          <h1 className="admin-login__title">
            Sign in to <em>manage</em> the site
          </h1>

          {sessionExpired && (
            <p className="admin-notice" role="status">
              <IconInfoCircle size={18} stroke={1.75} aria-hidden="true" />
              Your session expired. Please sign in again to continue.
            </p>
          )}

          <form className="admin-login__form" onSubmit={form.onSubmit(submit)} noValidate>
            {formError && (
              <div id="login-error" tabIndex={-1} className="admin-login__alert">
                <FormAlert title="Could not sign you in">{formError}</FormAlert>
              </div>
            )}
            <TextInput
              ref={emailRef}
              label="Email"
              type="email"
              autoComplete="username"
              inputMode="email"
              placeholder="you@company.com"
              withAsterisk
              {...form.getInputProps('email')}
            />
            <PasswordInput
              label="Password"
              autoComplete="current-password"
              withAsterisk
              visibilityToggleButtonProps={{ 'aria-label': 'Show or hide password' }}
              {...form.getInputProps('password')}
            />
            <Checkbox label="Keep me signed in on this device" {...form.getInputProps('remember', { type: 'checkbox' })} />
            <Button type="submit" block size="lg" loading={submitting}>
              Sign in
            </Button>
          </form>
          <p className="admin-login__note">Protected area. Access is limited to DIGIT-B staff.</p>
        </div>
      </main>
    </div>
  );
}
