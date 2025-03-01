"use client";

import { useState } from 'react';
import { BottomSheet } from 'react-spring-bottom-sheet';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import 'react-spring-bottom-sheet/dist/style.css';

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-card z-50 flex items-center justify-between px-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold">Portal VOD</h1>
        <div className="w-10" /> {/* Spacer for balance */}
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Menu */}
      <BottomSheet
        open={menuOpen}
        onDismiss={() => setMenuOpen(false)}
        snapPoints={[0.9]}
        className="bg-card rounded-t-xl"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Menu</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          {/* Menu Items */}
          <nav className="space-y-2">
            {/* Add your menu items here */}
          </nav>
        </div>
      </BottomSheet>
    </div>
  );
}