import { useCallback, useState } from 'react';
import { paperSound, type PaperSoundKind } from '../lib/paperSound.ts';

export interface PaperAudioControls {
  muted: boolean;
  toggleMute: () => void;
  play: (kind: PaperSoundKind) => void;
  startPeel: () => void;
  updatePeel: (speed: number, progress: number) => void;
  endPeel: (completed: boolean) => void;
}

export function usePaperAudio(): PaperAudioControls {
  const [muted, setMuted] = useState<boolean>(() => paperSound.isMuted());

  const toggleMute = useCallback(() => {
    const next = !paperSound.isMuted();
    paperSound.setMuted(next);
    setMuted(next);
    if (!next) {
      paperSound.play('tap');
    }
  }, []);

  const play = useCallback((kind: PaperSoundKind) => {
    paperSound.play(kind);
  }, []);

  const startPeel = useCallback(() => {
    paperSound.startPeel();
  }, []);

  const updatePeel = useCallback((speed: number, progress: number) => {
    paperSound.updatePeel(speed, progress);
  }, []);

  const endPeel = useCallback((completed: boolean) => {
    paperSound.endPeel(completed);
  }, []);

  return { muted, toggleMute, play, startPeel, updatePeel, endPeel };
}
