import React, { useState } from 'react';
import { useAuth } from '@resources/contexts';
import { Button, Input } from '@features/ui';
import { notify } from '@resources/helpers';

export function Login() {
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [twoFAIsRequired, setTwoFAIsRequired] = useState(false);
    const [form, setForm] = useState({
        email: '',
        password: '',
        two_fa_token: '',
        remember: false,
    });
    const [errors, setErrors] = useState({});

    function handleChange(event) {
        const { name, value, type, checked } = event.target;
        setForm((current) => ({
            ...current,
            [name]: type === 'checkbox' ? checked : value,
        }));
    }

    function validate() {
        const nextErrors = {};

        if (!form.email) {
            nextErrors.email = 'El correo es obligatorio';
        }

        if (!twoFAIsRequired && !form.password) {
            nextErrors.password = 'La contraseña es obligatoria';
        }

        if (twoFAIsRequired && !form.two_fa_token) {
            nextErrors.two_fa_token = 'Ingresa el código 2FA';
        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (!validate()) {
            return;
        }

        setLoading(true);

        login(form)
            .catch(({ response }) => {
                if (response?.data?.require_2fa) {
                    notify.info('Te enviamos un código de acceso a tu celular.');
                    setTwoFAIsRequired(true);
                }
            })
            .finally(() => setLoading(false));
    }

    return (
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="mb-6 text-center text-2xl font-semibold">
                {twoFAIsRequired ? 'Código 2FA' : 'Iniciar sesión'}
            </h1>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <Input
                    label="Correo electrónico"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={loading || twoFAIsRequired}
                    error={errors.email}
                />

                {!twoFAIsRequired && (
                    <Input
                        label="Contraseña"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        disabled={loading}
                        error={errors.password}
                    />
                )}

                {twoFAIsRequired && (
                    <Input
                        label="Código 2FA"
                        name="two_fa_token"
                        value={form.two_fa_token}
                        onChange={handleChange}
                        disabled={loading}
                        error={errors.two_fa_token}
                    />
                )}

                <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" name="remember" checked={form.remember} onChange={handleChange} />
                    Recordar dispositivo
                </label>

                <Button type="submit" loading={loading} className="w-full">
                    Entrar
                </Button>

                {twoFAIsRequired && (
                    <button
                        type="button"
                        className="text-sm text-primary-600 hover:underline"
                        onClick={() => {
                            setTwoFAIsRequired(false);
                            setForm({ email: '', password: '', two_fa_token: '', remember: false });
                        }}
                    >
                        Intentar con otra cuenta
                    </button>
                )}
            </form>
        </div>
    );
}
