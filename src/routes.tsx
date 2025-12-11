import React from 'react';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import RecuperarSenhaSolicitar from './components/auth/RecuperarSenhaSolicitar';
import RecuperarSenhaConfirmar from './components/auth/RecuperarSenhaConfirmar';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import AppLayout from './components/AppLayout';
import { Dashboard } from './components/Dashboard';
import ClientesList from './pages/ClientesList';
import BateriasList from './pages/BateriasList';
import CategoriasList from './pages/CategoriasList';
import GruposList from './pages/GruposList';
import SubgruposList from './pages/SubgruposList';
import VeiculosList from './pages/VeiculosList';
import ClienteDetails from './pages/clientes/ClienteDetails';
import EstoqueList from './pages/EstoqueList';
import AtendimentosList from './pages/AtendimentosList';
import FinanceiroPage from './pages/FinanceiroPage';
import MovimentacoesPage from './pages/MovimentacoesPage';

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/recuperar-senha" element={<RecuperarSenhaSolicitar />} />
        <Route path="/confirma/recuperar-senha" element={<RecuperarSenhaConfirmar />} />
        
        {/* Rotas Protegidas com Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/clientes"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ClientesList />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/baterias"
          element={
            <ProtectedRoute>
              <AppLayout>
                <BateriasList />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/categorias"
          element={
            <ProtectedRoute>
              <AppLayout>
                <CategoriasList />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/categorias/:id/grupos"
          element={
            <ProtectedRoute>
              <AppLayout>
                <GruposList />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/categorias/:id/grupos/:grupoId/subgrupos"
          element={
            <ProtectedRoute>
              <AppLayout>
                <SubgruposList />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/clientes/:id/veiculos"
          element={
            <ProtectedRoute>
              <AppLayout>
                <VeiculosList />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/clientes/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ClienteDetails />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/estoque"
          element={
            <ProtectedRoute>
              <AppLayout>
                <EstoqueList />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/atendimentos"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AtendimentosList />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/financeiro"
          element={
            <ProtectedRoute>
              <AppLayout>
                <FinanceiroPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/movimentacoes"
          element={
            <ProtectedRoute>
              <AppLayout>
                <MovimentacoesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Redirecionamento padrão */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
