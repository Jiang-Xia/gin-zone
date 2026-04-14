import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import RequireAuth from './RequireAuth';
import { AuthProvider } from '../store/auth';
import { TOKEN_KEY, USER_KEY } from '../constants/auth';

function renderWithRouter(initialPath: string) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<div>login page</div>} />
          <Route path="/403" element={<div>forbidden page</div>} />
          <Route element={<RequireAuth roles={['admin']} />}>
            <Route path="/user/list" element={<div>user list page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('RequireAuth', () => {
  it('redirects to login when token missing', () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    renderWithRouter('/user/list');
    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  it('redirects to 403 when role missing', () => {
    localStorage.setItem(TOKEN_KEY, 'Bearer token');
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        id: 1,
        userName: 'test',
        isAdmin: false,
        roles: [],
      }),
    );
    renderWithRouter('/user/list');
    expect(screen.getByText('forbidden page')).toBeInTheDocument();
  });
});
