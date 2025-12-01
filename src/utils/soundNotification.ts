// Utility for playing sound notifications

export const playSoundNotification = (type: 'new-order' | 'status-change') => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create oscillator for sound generation
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Connect oscillator to gain node and gain node to destination
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Set high volume
    gainNode.gain.value = 0.8;
    
    if (type === 'new-order') {
      // New order sound: A sequence of beeps (more urgent)
      const frequencies = [800, 1000, 1200];
      const duration = 0.2;
      
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          
          osc.connect(gain);
          gain.connect(audioContext.destination);
          
          osc.frequency.value = freq;
          osc.type = 'sine';
          
          gain.gain.value = 0.8;
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
          
          osc.start(audioContext.currentTime);
          osc.stop(audioContext.currentTime + duration);
        }, index * 250);
      });
      
    } else if (type === 'status-change') {
      // Status change sound: A pleasant notification tone
      const frequencies = [600, 800];
      const duration = 0.15;
      
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          
          osc.connect(gain);
          gain.connect(audioContext.destination);
          
          osc.frequency.value = freq;
          osc.type = 'sine';
          
          gain.gain.value = 0.7;
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
          
          osc.start(audioContext.currentTime);
          osc.stop(audioContext.currentTime + duration);
        }, index * 200);
      });
    }
    
  } catch (error) {
    console.error('Error playing sound:', error);
  }
};
