'use client';

import { usePathname } from 'next/navigation';
import BudgetEvChat from './BudgetEvChat';

export default function ClientChatWrapper() {
  const pathname = usePathname();

  // Disable the AI Chat widget on admin panel pages
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  console.log("ClientChatWrapper mounting BudgetEvChat component...");
  return <BudgetEvChat />;
}

