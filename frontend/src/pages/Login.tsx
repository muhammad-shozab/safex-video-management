import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, type Role } from '../context/AuthContext'

type Mode = 'signin' | 'signup'

export default function Login() {
  const { signIn, signInAs } = useAuth()
  const nav = useNavigate()
  const [mode, setMode] = useState<Mode>('signin')
  const [firstName, setFirstName] = useState('Shozab')
  const [lastName, setLastName] = useState('Haider')
  const [email, setEmail] = useState('shozab@safex.io')
  const [password, setPassword] = useState('demo1234')
  const [showPw, setShowPw] = useState(false)
  const [agree, setAgree] = useState(true)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    if (mode === 'signup' && !agree) { setErr('Please accept the terms to continue.'); return }
    setLoading(true)
    try {
      await signIn(email, password)
      nav('/dashboard')
    } catch (ex: any) { setErr(ex.message || 'Authentication failed') }
    finally { setLoading(false) }
  }

  const quickAs = (role: Role) => {
    signInAs(role)
    nav(role === 'Kids' ? '/kids' : '/dashboard')
  }

  return (
    <div className="auth-shell">
      <div className={`auth-card auth-split mode-${mode}`}>
        {/* LEFT — visual */}
        <aside className="auth-visual">
          <div className="auth-visual-inner">
            <div className="auth-brand-top">
              <div className="brand-mark auth-mark"><span className="brand-mono">SH</span><span className="brand-dot" /></div>
              <span className="auth-back" onClick={() => window.open('https://github.com/', '_blank')}>
                <i className="bi bi-arrow-up-right-circle" /> Portfolio
              </span>
            </div>
            <div className="auth-visual-copy">
              <h2 className="auth-visual-title">Curate.<br/>Review.<br/>Publish.</h2>
              <p className="auth-visual-sub">A safer educational video platform for kids and lifelong learners.</p>
              <div className="auth-dots">
                <span /><span /><span className="-on" />
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT — form */}
        <section className="auth-form">
          <div className="auth-form-inner">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h3 className="auth-heading">{mode === 'signup' ? 'Create an account' : 'Welcome back'}</h3>
                <div className="auth-sub small text-muted mt-1">
                  {mode === 'signup' ? 'Already have an account?' : 'New to SafeX?'}{' '}
                  <button className="link-btn" onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}>
                    {mode === 'signup' ? 'Log in' : 'Sign up'}
                  </button>
                </div>
              </div>
            </div>

            <form className="auth-fields" onSubmit={submit}>
              {mode === 'signup' && (
                <div className="row g-2">
                  <div className="col-6">
                    <input className="auth-input" placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} />
                  </div>
                  <div className="col-6">
                    <input className="auth-input" placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} />
                  </div>
                </div>
              )}
              <input className="auth-input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
              <div className="auth-input-wrap">
                <input className="auth-input" type={showPw ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
                <button type="button" className="auth-eye" onClick={() => setShowPw(s => !s)} aria-label="Toggle password">
                  <i className={`bi ${showPw ? 'bi-eye-slash' : 'bi-eye'}`} />
                </button>
              </div>

              {mode === 'signup' && (
                <label className="auth-check">
                  <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />
                  <span>I agree to the <a href="#" onClick={e => e.preventDefault()}>Terms & Conditions</a></span>
                </label>
              )}
              {mode === 'signin' && (
                <div className="d-flex justify-content-between small">
                  <label className="auth-check"><input type="checkbox" defaultChecked /><span>Remember me</span></label>
                  <a href="#" className="auth-link" onClick={e => e.preventDefault()}>Forgot password?</a>
                </div>
              )}

              {err && <div className="auth-err">{err}</div>}

              <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
                {loading ? (mode === 'signup' ? 'Creating…' : 'Signing in…') : (mode === 'signup' ? 'Create account' : 'Sign in')}
              </button>

              <div className="auth-divider"><span>Or continue with</span></div>

              <div className="row g-2">
                <div className="col-6"><button type="button" className="auth-oauth" onClick={() => quickAs('Admin')}>
                  <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                  Google
                </button></div>
                <div className="col-6"><button type="button" className="auth-oauth" onClick={() => quickAs('Kids')}>
                  <i className="bi bi-apple" /> Apple
                </button></div>
              </div>

              <div className="auth-quick">
                <span className="small text-muted">Quick demo:</span>
                <button type="button" className="quick-chip" onClick={() => quickAs('Admin')}>Admin</button>
                <button type="button" className="quick-chip" onClick={() => quickAs('General')}>General</button>
                <button type="button" className="quick-chip" onClick={() => quickAs('Kids')}>Kids</button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}
