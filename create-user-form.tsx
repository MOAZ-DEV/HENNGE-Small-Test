import { useState, type CSSProperties, type Dispatch, type SetStateAction, type ChangeEvent, type FormEvent } from 'react';

interface CreateUserFormProps {
  setUserWasCreated: Dispatch<SetStateAction<boolean>>;
}

interface InputProps {
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: {
    message?: string;
    invalid?: boolean
  };
}

const UsernameInput = ({ onChange, error }: InputProps) => (
  <div style={formField}>
    <label style={formLabel} htmlFor="Username">Username</label>
    <input
      id="Username"
      name="username"
      type="text"
      aria-label="Username"
      aria-invalid={!!error?.invalid}
      aria-describedby={error?.invalid ? 'username-error' : undefined}
      placeholder="Enter your username"
      style={{ ...formInput, ...(error?.invalid && { borderColor: 'red' }) }}
      onChange={onChange}
    />
    {error?.message && <div id="username-error" style={formError}>{error.message}</div>}
  </div>
);

const PasswordInput = ({ onChange, error }: InputProps) => (
  <div style={formField}>
    <label style={formLabel} htmlFor="Password">Password</label>
    <input
      id="Password"
      name="password"
      type="password"
      aria-label="Password"
      aria-invalid={!!error?.invalid}
      aria-describedby={error?.invalid ? 'password-error' : undefined}
      placeholder="Enter your password"
      style={{ ...formInput, ...(error?.invalid && { borderColor: 'red' }) }}
      onChange={onChange}
    />
    {error?.message && <div id="password-error" style={formError}>{error.message}</div>}
  </div>
);

type FormData = {
  username?: string;
  password?: string
};

type FormError = {
  username?: {
    message?: string;
    invalid?: boolean
  };
  password?: {
    message?: string;
    invalid?: boolean
  };
  submit?: string
};

type UsernameRulesStatus = {
  noLeadingOrTrailingSpecial: boolean;
  noConsecutiveSpecial: boolean;
  validCharacters: boolean;
  minLength: boolean;
  maxLength: boolean;
};

type PasswordRulesStatus = {
  noSpaces: boolean;
  hasNumber: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  minLength: boolean;
  maxLength: boolean;
};

const checkUsernameRules = (username: string): UsernameRulesStatus => ({
  noLeadingOrTrailingSpecial: !/^[._]|[._]$/.test(username),
  noConsecutiveSpecial: !/[._]{2,}/.test(username),
  validCharacters: /^[a-zA-Z0-9._]+$/.test(username),
  minLength: username.length >= 3,
  maxLength: username.length <= 20,
});

const checkPasswordRules = (password: string): PasswordRulesStatus => ({
  noSpaces: !/\s/.test(password),
  hasNumber: /\d/.test(password),
  hasUpper: /[A-Z]/.test(password),
  hasLower: /[a-z]/.test(password),
  minLength: password.length >= 10,
  maxLength: password.length <= 24,
});

const PasswordCriteriaList = ({ password }: { password: string }) => {
  const rules = checkPasswordRules(password || '');
  const messages: string[] = [];

  if (!rules.noSpaces) messages.push('Password cannot contain spaces');
  if (!rules.minLength || !rules.maxLength) messages.push('Password must be between 10 and 24 characters long');
  if (!rules.hasNumber) messages.push('Password must contain at least one number');
  if (!rules.hasUpper) messages.push('Password must contain at least one uppercase letter');
  if (!rules.hasLower) messages.push('Password must contain at least one lowercase letter');

  if (messages.length === 0) return null;

  return (
    <ul style={criteriaListStyle}>
      {messages.map((msg, i) => (
        <li key={i} style={criteriaItemStyle}>{msg}</li>
      ))}
    </ul>
  );
};

function CreateUserForm({ setUserWasCreated }: CreateUserFormProps) {
  const [formData, setFormData] = useState<FormData>({});
  const [error, setError] = useState<FormError>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    validate(updated, false);
  };

  const validate = (data: FormData, submitAttempt: boolean): boolean => {
    const { username, password } = data;
    const errs: FormError = {};

    if (!username)
      errs.username = {
        message: 'Username is required.',
        invalid: true
      };
    else {
      const r = checkUsernameRules(username);
      if (!r.minLength || !r.maxLength) errs.username = { message: 'Username must be between 3 and 20 characters long.', invalid: true };
      else if (!r.validCharacters) errs.username = { message: 'Username can only contain letters, numbers, ".", or "_."', invalid: true };
      else if (!r.noLeadingOrTrailingSpecial) errs.username = { message: 'Username cannot start or end with "." or "_."', invalid: true };
      else if (!r.noConsecutiveSpecial) errs.username = { message: 'Username cannot contain consecutive "." or "_."', invalid: true };
    }

    if (!password)
      errs.password = { message: 'Password is required.', invalid: true };
    else {
      const r = checkPasswordRules(password);
      if (!r.minLength || !r.maxLength) errs.password = { invalid: true };
      else if (!r.hasNumber) errs.password = { invalid: true };
      else if (!r.hasUpper) errs.password = { invalid: true };
      else if (!r.hasLower) errs.password = { invalid: true };
    }

    if (submitAttempt && Object.keys(errs).length > 0) {
      errs.submit = 'Please fix the errors before submitting.';
    }

    setError(errs);
    return Object.keys(errs).length === 0;
  };

  const submitFormData = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      const res = await fetch('https://api.challenge.hennge.com/password-validation-challenge-api/001/challenge-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsibW9hYXphbGxhZWxkZW5AZ21haWwuY29tIl0sImlzcyI6Imhlbm5nZS1hZG1pc3Npb24tY2hhbGxlbmdlIiwic3ViIjoiY2hhbGxlbmdlIn0.GnSOGrRSVvtEBwdQfqCw4s6NPkwwUAQ5dxkfVa0vsmo`,
        },
        body: JSON.stringify(data),
      });

      if (res.status === 401 || res.status === 403) {
        return { success: false, message: 'Not authenticated to access this resource.' };
      }
      if (res.status === 400) {
        return { success: false, message: 'Sorry, the entered password is not allowed, please try a different one.' };
      }
      if (!res.ok) {
        return { success: false, message: 'Something went wrong, please try again.' };
      }
      return { success: true };
    } catch (err) {
      console.error('Submission error:', err);
      return { success: false, message: 'Network error. Please try again later.' };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate(formData, true)) return;
    submitFormData(formData).then(result => {
      if (result.success) {
        setError({});
        setUserWasCreated(true);
      } else {
        setError({ submit: result.message });
      }
    });
  };

  return (
    <div style={formWrapper}>
      <form onSubmit={handleSubmit} style={form} noValidate>
        <UsernameInput onChange={handleChange} error={error.username} />
        <PasswordInput onChange={handleChange} error={error.password} />
        <PasswordCriteriaList password={formData.password || ''} />
        <button type="submit" style={{ ...formButton, ...(isSubmitting && { opacity: 0.5, cursor: 'not-allowed' }) }} disabled={isSubmitting} >Create User</button>
        {error.submit && <div style={formError}>{error.submit}</div>}
      </form>
    </div>
  );
}

export { CreateUserForm };

const formWrapper: CSSProperties = {
  maxWidth: '500px',
  width: '80%',
  backgroundColor: '#efeef5',
  padding: '24px',
  borderRadius: '8px',
};

const form: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const formLabel: CSSProperties = {
  fontWeight: 700,
};

const formInput: CSSProperties = {
  outline: 'none',
  padding: '8px 16px',
  height: '40px',
  fontSize: '14px',
  backgroundColor: '#f8f7fa',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'rgba(0, 0, 0, 0.12)',
  borderRadius: '4px',
};

const formButton: CSSProperties = {
  outline: 'none',
  borderRadius: '4px',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  backgroundColor: '#7135d2',
  color: 'white',
  fontSize: '16px',
  fontWeight: 500,
  height: '40px',
  padding: '0 8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '8px',
  alignSelf: 'flex-end',
  cursor: 'pointer',
};

const formField: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  marginBottom: '4px',
  width: '100%',
}

const formError: CSSProperties = {
  color: 'grey',
  fontSize: '14px',
  marginTop: '8px',
};

const criteriaListStyle: CSSProperties = {
  paddingLeft: '16px',
  color: 'gray',
  fontSize: '14px',
  margin: '4px 0',
};

const criteriaItemStyle: CSSProperties = {
  marginBottom: '4px',
};