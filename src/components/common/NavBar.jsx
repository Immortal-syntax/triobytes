import React from 'react';
import { NavLink } from 'react-router-dom';
import { useI18n } from '../../context/I18nContext.jsx';
import { HomeIcon, TicketIcon, ClockIcon, MapPinIcon, StaffBadgeIcon } from './Icons.jsx';

export default function NavBar() {
  const { t } = useI18n();

  const navItems = [
    { to: '/', label: t('nav.home'), icon: HomeIcon, id: 'nav-home' },
    { to: '/register', label: t('nav.register'), icon: TicketIcon, id: 'nav-register' },
    { to: '/queue', label: t('nav.myToken'), icon: ClockIcon, id: 'nav-queue' },
    { to: '/map', label: t('nav.map'), icon: MapPinIcon, id: 'nav-map' },
    { to: '/staff', label: t('nav.staff'), icon: StaffBadgeIcon, id: 'nav-staff' },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Main Navigation"
      className="sticky bottom-0 z-40 w-full bg-white dark:bg-slate-900 border-t-2 border-slate-300 dark:border-slate-700 shadow-xl"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-around px-1 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              id={item.id}
              to={item.to}
              className={({ isActive }) =>
                `min-h-[56px] flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl font-bold text-xs sm:text-sm transition-colors focus:ring-4 focus:ring-hospital-400 focus:outline-none ${
                  isActive
                    ? 'text-hospital-700 dark:text-hospital-300 bg-hospital-100 dark:bg-hospital-950/80 font-black border-2 border-hospital-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-hospital-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`
              }
            >
              <Icon className="w-6 h-6 mb-0.5 flex-shrink-0" />
              <span className="text-center line-clamp-1 leading-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
