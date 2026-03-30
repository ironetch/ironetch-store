import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { auth, signOut } from '@/auth';
import CartButton from '@/components/CartButton';
import MobileMenu from '@/components/MobileMenu';

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass cyan-border m-4 rounded-2xl overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full border border-cyan-laser overflow-hidden cyan-glow">
            <Image 
              src="/logo.png" 
              alt="IronEtch Logo" 
              fill
              className="object-cover"
            />
          </div>
          <span className="font-bold text-xl tracking-tight hidden md:block">
            IRON<span className="text-cyan-laser">ETCH</span>
          </span>
        </Link>

        <MobileMenu />

        <div className="flex items-center gap-4">
          {session?.user ? (
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-400">Hi, {session.user.name?.split(' ')[0] || session.user.email}</span>
              <form action={async () => {
                "use server";
                await signOut({ redirectTo: '/' });
              }}>
                <button type="submit" className="text-xs font-bold text-slate-400 hover:text-red-400 transition-colors uppercase tracking-widest">
                  Log Out
                </button>
              </form>
            </div>
          ) : (
             <Link href="/login" className="px-4 py-2 text-sm font-bold border border-slate-700 text-white rounded-lg hover:border-cyan-laser transition-all">
               SIGN IN
             </Link>
          )}

          <CartButton />
        </div>
      </div>
    </nav>
  );
}
