import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/auth';
import LanguagePicker from './LanguagePicker';
import {
  Menu,
  Bell,
  LogOut,
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  User,
  Home,
  Dumbbell,
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const isCoach = user?.role === 'Coach';

  const getTitle = () => {
    if (isCoach) {
      if (location.pathname.includes('/meals')) return t('layout.meals');
      if (location.pathname.includes('/programs')) return t('layout.programs');
      if (location.pathname.includes('/clients/')) return t('layout.clientDetail');
      return t('layout.coachDashboard');
    }
    if (location.pathname.includes('/progress')) return t('layout.progressTracker');
    if (location.pathname.includes('/meals/')) return t('layout.meals');
    if (location.pathname.includes('/programs/')) return t('layout.myProgram');
    return t('layout.dashboard');
  };

  const coachNav = [
    { to: '/coach', icon: LayoutDashboard, label: t('layout.dashboard') },
    { to: '/coach/programs', icon: ClipboardList, label: t('layout.programs') },
    { to: '/coach/meals', icon: UtensilsCrossed, label: t('layout.meals') },
    { to: '/coach', icon: User, label: t('layout.profile') },
  ];

  const clientNav = [
    { to: '/client', icon: Home, label: t('layout.home') },
    { to: '/client#programs', icon: Dumbbell, label: t('layout.programs') },
    { to: '/client', icon: User, label: t('layout.profile') },
  ];

  const navItems = isCoach ? coachNav : clientNav;

  const isActive = (to: string, idx: number) => {
    if (idx === navItems.length - 1) return false;

    if (to.includes('#')) {
      const [base, frag] = to.split('#');
      return (
        location.pathname.startsWith(`${base}/programs`) ||
        (location.pathname === base && location.hash === `#${frag}`)
      );
    }

    if (to === '/coach') return location.pathname === '/coach';
    if (to === '/client') {
      return (
        location.pathname === '/client' &&
        location.hash !== '#programs' &&
        !location.pathname.startsWith('/client/programs')
      );
    }

    return location.pathname.startsWith(to);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-[#1B2A4A] sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button type="button" className="p-1 text-white/70 hover:text-white" aria-label={t('layout.menu')}>
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-white font-semibold text-lg">{getTitle()}</h1>
          <div className="flex items-center gap-2">
            <LanguagePicker variant="dark" />
            <button type="button" className="p-1 text-white/70 hover:text-white relative" aria-label={t('layout.notifications')}>
              <Bell className="h-5 w-5" />
            </button>
            <button type="button" onClick={logout} className="p-1 text-white/70 hover:text-red-400" aria-label={t('layout.logOut')}>
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-4 pb-20">
        <Outlet />
      </main>

      <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-40">
        <div className="max-w-5xl mx-auto flex justify-around">
          {navItems.map(({ to, icon: Icon, label }, idx) => (
            <Link
              key={label}
              to={to}
              className={`flex flex-col items-center py-2.5 px-3 text-xs transition-colors ${
                isActive(to, idx) ? 'text-teal-600' : 'text-gray-400'
              }`}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
