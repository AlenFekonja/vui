import React, { useEffect } from 'react';
import { getAndParseJWT } from '../components/jwt.tsx';
import annyang from 'annyang';
import { Button } from '@mui/material';

const VoiceCommand = () => {
  useEffect(() => {
    if (annyang) {
      const commands: { [key: string]: () => void } = {
        'settings': navigatePreference,
        'my level': myLevel,
        'logout': logout,
        'level up': levelUp,
        'reset': reset,
      };

      annyang.addCommands(commands);

      const startButton = document.getElementById('start-btn');
      if (startButton) {
        startButton.addEventListener('click', () => {
          annyang?.start({ autoRestart: true, continuous: false });
          setTimeout(() => {
            annyang?.abort();
          }, 10000);

          speakText('Choose between commands: settings, my level, logout, level up or reset');
        });
      }
    } else {
      alert('Error: annyang is not available.');
    }
  }, []);

  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  const myLevel = () => {
    const parsedJWT = getAndParseJWT();
    if (!parsedJWT) {
      showNotification('JWT is not valid!', '');
      return;
    }
    speakText(`Your level is ${parsedJWT.payload.level}`);
  };

  const levelUp = () => {
    const parsedJWT = getAndParseJWT();
    if (!parsedJWT) {
      showNotification('JWT is not valid!', '');
      return;
    }
    speakText(`Your next level is in ${100 - parseInt(parsedJWT.payload.points, 10)} points`);
  };

  const logout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    window.location.href = '/frontend/';
    speakText('Executing logout');
  };

  const navigatePreference = () => {
    window.location.href = '/frontend/components/preference.html';
    speakText('Executing navigate to settings');
  };

  const reset = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);

    const timeDifference = midnight.getTime() - now.getTime();
    const hours = Math.floor(timeDifference / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

    speakText(`Time until daily quests reset: ${hours} hours, ${minutes} minutes`);
  };

  const showNotification = (message: string, details: string) => {
    alert(`${message} ${details}`);
  };

  return (
    <Button id="start-btn" sx={{ all: 'unset' }}>
      Start Voice Commands
    </Button>
  );
};

export default VoiceCommand;