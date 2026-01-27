
'use client';

import { useEffect, useState } from 'react';
import { useBudget } from '@/context/budget-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

const POPUP_SESSION_KEY = 'globalPopupShown';

export function GlobalPopup() {
  const { globalPopup, isLoading } = useBudget();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isLoading || !globalPopup || !globalPopup.isEnabled) {
      return;
    }

    const sessionValue = sessionStorage.getItem(POPUP_SESSION_KEY);
    if (sessionValue) {
      return;
    }

    // If config is enabled and not shown in this session, show it.
    setIsOpen(true);
    sessionStorage.setItem(POPUP_SESSION_KEY, 'true');

  }, [globalPopup, isLoading]);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen || !globalPopup || !globalPopup.isEnabled) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-6 w-6 text-primary" />
            {globalPopup.title || 'একটি জরুরি বার্তা'}
          </DialogTitle>
          <DialogDescription className="pt-4 text-base text-foreground">
            {globalPopup.message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleClose}>বন্ধ করুন</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
