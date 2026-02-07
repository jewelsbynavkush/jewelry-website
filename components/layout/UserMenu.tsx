'use client';

/**
 * User Menu Component
 * 
 * Industry-standard user dropdown menu with logout functionality
 * Similar to Google, Facebook, Amazon user menus
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/store/auth-store';
import SmoothLink from '@/components/ui/SmoothLink';
import { ANIMATION_PRESETS, SCALE } from '@/lib/animations/constants';

interface UserMenuProps {
  textColor: string;
}

export default function UserMenu({ textColor }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { user, isAuthenticated, logout, isLoading } = useAuthStore();

  // Close dropdown menu when user clicks outside menu or button
  // Excludes clicks on menu button to allow toggling without closing
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close dropdown menu on Escape key press for keyboard accessibility
  // Follows WCAG guidelines for keyboard navigation in dropdown menus
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    // Logout function handles redirect to home page after clearing auth state
    await logout();
  };

  if (!isAuthenticated || !user) {
    return (
      <motion.div
        initial={{ scale: 1, rotate: 0 }}
        whileHover={ANIMATION_PRESETS.ICON_HOVER}
        whileTap={ANIMATION_PRESETS.ICON_TAP}
        className="flex items-center"
      >
        <SmoothLink
          href="/auth/login"
          className="transition-colors p-2 -mr-2 sm:p-0 sm:mr-0 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center relative"
          style={{ color: textColor }}
          aria-label="Login"
        >
          <motion.svg 
            className="w-5 h-5 sm:w-6 sm:h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            initial={{ scale: 1 }}
            whileHover={{ scale: SCALE.HOVER }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </motion.svg>
        </SmoothLink>
      </motion.div>
    );
  }

  const userInitials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';

  return (
    <div className="relative flex items-center">
      <motion.button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="transition-colors p-2 -mr-2 sm:p-0 sm:mr-0 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--active-dark)] focus-visible:ring-offset-2 cursor-pointer"
        style={{ color: textColor || 'var(--text-on-beige)' }}
        aria-label={`User menu for ${user?.firstName}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        whileHover={!isOpen ? ANIMATION_PRESETS.ICON_HOVER : {}}
        whileTap={!isOpen ? ANIMATION_PRESETS.ICON_TAP : {}}
      >
        <span className="text-base sm:text-lg font-inter font-medium">
          {userInitials || 'U'}
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-56 sm:w-60 bg-[var(--cream)] rounded-lg shadow-lg py-2 z-[100] border border-[var(--border-light)]"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu-button"
            style={{ position: 'absolute' }}
          >
            {/* User Info */}
            <div className="px-4 py-2 text-sm text-[var(--text-on-cream)] border-b border-[var(--border-light)]">
              <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
              <p className="text-[var(--text-secondary)] text-xs mt-0.5">{user?.mobile}</p>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <motion.div
                whileHover={{ x: 2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <SmoothLink
                  href="/profile"
                  className="block w-full text-left px-4 py-2 text-sm text-[var(--text-on-cream)] hover:bg-[var(--black-opacity-4)] transition-colors min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-[var(--beige)] focus:ring-offset-2"
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                  animated={false}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>My Profile</span>
                  </div>
                </SmoothLink>
              </motion.div>
            </div>

            {/* Logout */}
            <div className="border-t border-[var(--border-light)] my-1" />
            <motion.div
              whileHover={{ x: 2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-[var(--text-on-cream)] hover:bg-[var(--black-opacity-4)] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-[var(--beige)] focus:ring-offset-2"
                role="menuitem"
                disabled={isLoading}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </div>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
