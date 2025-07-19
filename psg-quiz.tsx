"use client"

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Trophy, DollarSign, Star } from "lucide-react"
import Image from "next/image"
import PriceAnchoring from "@/components/price-anchoring"
import Script from "next/script"
import Head from "next/head"
import styles from '@/styles/animations.module.css'
import PartnersFooter from "@/components/partners-footer"
import { trackEvent as trackPixelEvent, trackQuizStep, useTikTokClickIdCapture } from "@/lib/utils"

// Adicionar animação keyframes para a barra de progresso
const progressBarStyles = `
  @keyframes progress {
    from { width: 100%; }
    to { width: 0%; }
  }
  
  @keyframes progressReverse {
    from { width: 0%; }
    to { width: 100%; }
  }
`

// Declare tipos globais para os pixels
declare global {
  interface Window {
    TiktokAnalyticsObject?: string;
    ttq?: any;
    _fbq?: any;
    fbq?: any;
    pixelId?: string;
  }
}

interface Question {
  id: number
  question: string
  options: string[]
  correct: number
  explanation: string
}

const questions: Question[] = [
  {
    id: 1,
    question: "Who scored Chelsea's first goal in the final against PSG?",
    options: ["Sterling", "Enzo Fernández", "Cole Palmer", "Reece James"],
    correct: 2,
    explanation: "Cole Palmer scored Chelsea's first goal in the final against PSG!",
  },
  {
    id: 2,
    question: "How many Champions League titles does Chelsea have?",
    options: ["1", "2", "3", "None"],
    correct: 1,
    explanation: "Chelsea has won 2 Champions League titles in their history!",
  },
  {
    id: 3,
    question: "What is Chelsea's traditional shirt color?",
    options: ["Blue", "Red", "White", "Green"],
    correct: 0,
    explanation: "Chelsea's traditional shirt color is Blue - the famous Chelsea Blue!",
  },
  {
    id: 4,
    question: "What's the name of Chelsea's home stadium?",
    options: ["Old Trafford", "Stamford Bridge", "Wembley", "Anfield"],
    correct: 1,
    explanation: "Stamford Bridge is Chelsea's historic home stadium since 1905!",
  },
]

// Enhanced notification component with better animations
const SuccessNotification = ({ show, onClose }: { show: boolean; onClose: () => void }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      setProgress(100)
      
      // Update progress every 100ms for smoother animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            clearInterval(progressInterval)
            return 0
          }
          return prev - 2 // Decrease 2% every 100ms = 5 seconds total
        })
      }, 100)
      
      const timer = setTimeout(() => {
        setIsExiting(true)
        setTimeout(() => {
          setIsVisible(false)
          setTimeout(() => {
            onClose()
            setIsExiting(false)
            setProgress(100) // Reset progress
          }, 500) // Increased exit animation time
        }, 200)
      }, 5000) // Increased display time to 5 seconds

      return () => {
        clearTimeout(timer)
        clearInterval(progressInterval)
      }
    }
  }, [show, onClose])

  if (!show) return null

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-700 transform ${
        isVisible && !isExiting 
          ? "translate-x-0 opacity-100 scale-100" 
          : "translate-x-full opacity-0 scale-95"
      }`}
    >
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 border border-green-400 backdrop-blur-sm">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
          <DollarSign className="h-8 w-8 text-green-500 animate-bounce" />
        </div>
        <div>
          <p className="font-bold text-lg">Congratulations! 🎉</p>
          <p className="text-sm opacity-90">You earned £25 discount!</p>
        </div>
        <button 
          onClick={onClose}
          className="ml-2 text-white hover:text-gray-200 transition-colors duration-200"
          aria-label="Close notification"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="absolute bottom-0 left-0 h-1 bg-green-300 rounded-b-xl" style={{ 
          width: `${progress}%`,
          transition: 'width 0.1s linear'
        }}></div>
      </div>
    </div>
  )
}

// Falling hearts component
const FallingHeart = ({ delay }: { delay: number }) => (
  <div 
    className={`absolute text-red-500 text-2xl pointer-events-none ${styles.fall}`}
    style={{
      left: `${Math.random() * 100}%`,
      top: '-50px',
      animationDelay: `${delay}ms`
    }}
  >
    ❤️
  </div>
)

// Chelsea lion icon component
const ChelseaLionIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-8 h-8"
    fill="currentColor"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

const LikeSystem = () => {
  const [liked, setLiked] = useState(false)
  const [showHearts, setShowHearts] = useState(false)
  const [showPeople, setShowPeople] = useState(false)
  const [likeCount, setLikeCount] = useState(1247)

  // Photos of people who liked
  const peopleWhoLiked = [
    { id: 1, name: "Mary", avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c5e2?w=60&h=60&fit=crop&crop=face" },
    { id: 2, name: "John", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face" },
    { id: 3, name: "Anna", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face" },
    { id: 4, name: "Peter", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face" },
    { id: 5, name: "Carla", avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=60&h=60&fit=crop&crop=face" },
    { id: 6, name: "Luke", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face" }
  ]

  const handleLike = () => {
    if (!liked) {
      setLiked(true)
      setLikeCount(prev => prev + 1)
      setShowHearts(true)
      
      setTimeout(() => {
        setShowPeople(true)
      }, 1000)

      setTimeout(() => {
        setShowHearts(false)
      }, 3000)

      setTimeout(() => {
        setShowPeople(false)
      }, 5000)
    }
  }

  return (
    <div className="relative">
      {/* Seção de ícones e avaliações */}
      <div className="flex items-center justify-center gap-6 mb-4">
        {/* Trustpilot */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 mb-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} className="w-4 h-4 text-[#00b67a]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            ))}
          </div>
          <span className="text-[11px] text-black">Trustpilot</span>
        </div>

        {/* Separador vertical */}
        <div className="h-8 w-px bg-white/10"></div>

        {/* Separador vertical */}
        <div className="h-8 w-px bg-white/10"></div>

        {/* Botão de curtir */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 transition-all duration-300 ${
            liked 
              ? 'text-red-400 scale-110' 
              : 'text-white/70 hover:text-white'
          }`}
        >
          <span className={`text-2xl transition-all duration-300 ${liked ? 'animate-pulse' : ''}`}>
            {liked ? '❤️' : '🤍'}
          </span>
          <span className="text-sm text-black font-medium">{likeCount.toLocaleString()}</span>
        </button>
      </div>

              {/* Heart rain */}
      {showHearts && (
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <FallingHeart key={i} delay={i * 200} />
          ))}
        </div>
      )}

      {/* Fotos das pessoas que curtiram */}
      {showPeople && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-scaleIn">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-black mb-2">Pessoas que curtiram ❤️</h3>
              <p className="text-sm text-gray-600">¡Únete a {likeCount.toLocaleString()} aficionados!</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              {peopleWhoLiked.map((person, index) => (
                <div 
                  key={person.id}
                  className="text-center animate-fadeIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-2 border-2 border-gray-200">
                    <img 
                      src={person.avatar} 
                      alt={person.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-gray-600 font-medium">{person.name}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowPeople(false)}
              className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Loading component for better UX
const LoadingSpinner = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  }
  
  return (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`}></div>
  )
}

// Componente de vídeo simplificado
const VideoPlayer = React.memo(({ isReady }: { isReady: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showMuteButton, setShowMuteButton] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const forcePlay = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => {
            console.log("Não foi possível iniciar o vídeo automaticamente");
          });
        });
      }
    };

    forcePlay();
    video.addEventListener('canplay', forcePlay);
    video.addEventListener('loadeddata', forcePlay);
    setTimeout(forcePlay, 1000);

    return () => {
      video.removeEventListener('canplay', forcePlay);
      video.removeEventListener('loadeddata', forcePlay);
    };
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
      if (!videoRef.current.muted) {
        // Se foi desmutado, esconde o botão após um pequeno delay
        setTimeout(() => {
          setShowMuteButton(false);
        }, 500);
      }
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}>
      <video
        ref={videoRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '25px'
        }}
        autoPlay
        playsInline
        controls={false}
        preload="auto"
        src="videos/vsl.mp4"
      />
      {showMuteButton && (
        <button
          onClick={toggleMute}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            background: 'rgba(0, 0, 0, 0.6)',
            border: 'none',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            transition: 'opacity 0.3s ease'
          }}
        >
          {isMuted ? (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

// Componente de Layout para os scripts simplificado - removido pois já está no layout global
// const PixelScripts = () => (
//   <>
//   </>
// );

// Hook para controlar o carregamento dos pixels - simplificado
const usePixelLoader = () => {
  const [isPixelsReady, setPixelsReady] = useState(false);
  const pixelsInitialized = useRef(false);

  useEffect(() => {
    if (pixelsInitialized.current) {
      setPixelsReady(true);
      return;
    }

    // Verifica se os pixels estão carregados (Facebook no layout global)
    const checkPixels = () => {
      return window.fbq && window.ttq;
    };

    // Função que verifica os pixels
    const checkAll = () => {
      if (checkPixels()) {
        setPixelsReady(true);
        pixelsInitialized.current = true;
        clearInterval(checkInterval);
      }
    };

    // Inicia verificação periódica
    const checkInterval = setInterval(checkAll, 500);

    // Timeout de segurança após 5 segundos
    const timeoutId = setTimeout(() => {
      setPixelsReady(true);
      pixelsInitialized.current = true;
      clearInterval(checkInterval);
    }, 5000);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeoutId);
    };
  }, []);

  return isPixelsReady;
};

// Rastrear visualização da VSL apenas uma vez globalmente
const useTrackVSLView = () => {
  useEffect(() => {
    setTimeout(() => {
      trackQuizStep('vsl_view'); // Rastrear visualização do vídeo
    }, 1000);
  }, []);
};

// Hook personalizado para gerenciar elementos escondidos (não é mais necessário)
function useDelayedElements() {
  // O delay agora é controlado pelo VTurb
  return;
}

const useAudioSystem = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAudio = () => {
      try {
        if (!audioRef.current) {
          const audio = new Audio("https://cdn.shopify.com/s/files/1/0946/2290/8699/files/notifica_o-venda.mp3?v=1749150271");
          audio.preload = "auto";
          audio.volume = 1;
          audioRef.current = audio;

          // Inicializa o contexto de áudio para dispositivos móveis
          const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
          if (AudioContext) {
            const audioContext = new AudioContext();
            if (audioContext.state === "suspended") {
              audioContext.resume();
            }
          }
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };

    // Inicializa na primeira interação
    const handleFirstInteraction = () => {
      initializeAudio();
      document.removeEventListener("touchstart", handleFirstInteraction);
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };

    document.addEventListener("touchstart", handleFirstInteraction, { passive: true });
    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("keydown", handleFirstInteraction);

    return () => {
      document.removeEventListener("touchstart", handleFirstInteraction);
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };
  }, []);

  const playSound = useCallback(() => {
    try {
      if (audioRef.current && isInitialized) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(error => {
          console.error('Error playing sound:', error);
        });
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, [isInitialized]);

  return { playSound, isInitialized };
};

// Componente do painel USP - versão minimalista Adidas
const USPPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-20 flex items-start justify-center">
      <div className="bg-white w-full max-w-4xl mt-12 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4">
          <div className="text-xs font-medium uppercase tracking-[0.25em] text-black">Chelsea FC</div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-50 transition-colors duration-150"
            aria-label="Close"
          >
            <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-3 gap-px bg-gray-100">
          {/* History */}
          <div className="p-12 text-center bg-white">
            <div className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-6">Est. 1905</div>
            <div className="text-sm text-gray-900 mb-2 leading-relaxed">
              Stamford Bridge
            </div>
            <div className="text-xs text-gray-500">
              London
            </div>
          </div>

          {/* Achievements */}
          <div className="p-12 text-center bg-white">
            <div className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-6">Honours</div>
            <div className="text-sm text-gray-900 mb-2 leading-relaxed">
              Champions League
            </div>
            <div className="text-xs text-gray-500">
              2012 • 2021
            </div>
          </div>

          {/* Legacy */}
          <div className="p-12 text-center bg-white">
            <div className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-6">Legacy</div>
            <div className="text-sm text-gray-900 mb-2 leading-relaxed">
              Premier League
            </div>
            <div className="text-xs text-gray-500">
              6 Titles
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 text-center">
          <div className="text-xs text-gray-400 uppercase tracking-[0.2em]">The Pride of London</div>
        </div>
      </div>
    </div>
  )
}

// Componente do carrossel do header com largura ajustada
const HeaderCarousel = () => {
  const messages = [
    "Let's go Chelsea",
    "Exclusive",
    "Champions Collection"
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative">
        {/* Gradiente da esquerda */}
        <div className="absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-white to-transparent z-10"></div>
        
        {/* Gradiente da direita */}
        <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white to-transparent z-10"></div>
        
        {/* Mensagens do carrossel */}
        <div className="relative">
          <div className="flex justify-center items-center min-h-[2rem] overflow-hidden">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`absolute w-full text-center transition-all duration-500 transform ${
                  index === currentIndex
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
              >
                <span className="text-gray-900 tracking-[0.45em] uppercase font-adidasFG text-sm">{message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente do ícone de coração moderno
const HeartIcon = ({ isLiked, onClick }: { isLiked: boolean; onClick: () => void }) => {
  const [showBurst, setShowBurst] = useState(false);
  
  const handleClick = () => {
    onClick();
    if (!isLiked) {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 700);
    }
  };

  return (
    <div className="relative">
      {showBurst && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`absolute w-full h-full ${styles.heartBurst}`}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-red-500 rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${i * 60}deg) translateY(-10px)`,
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      <button
        onClick={handleClick}
        className="relative p-2 rounded-lg transition-colors duration-200 group"
        aria-label="Like"
      >
        <svg
          className={`w-8 h-8 transition-all duration-300 ${isLiked ? styles.heartPop : ''}`}
          viewBox="0 0 24 24"
          fill={isLiked ? '#ef4444' : 'none'}
          stroke={isLiked ? '#ef4444' : 'currentColor'}
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        </svg>
      </button>
    </div>
  );
};

// Componente do ícone do Trustpilot
const TrustpilotStars = () => (
  <div className="flex items-center space-x-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg key={star} className="w-4 h-4 text-[#00b67a]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    ))}
  </div>
);

// Modificar o CompleteHeader para incluir o carrossel na posição correta
const CompleteHeader = ({ onUSPClick }: { onUSPClick: () => void }) => {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <header data-auto-id="header" className="bg-white font-size-12 border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      {/* USP Bar */}
      <button 
        onClick={(e) => {
          e.preventDefault()
          console.log('USP button clicked')
          onUSPClick()
        }}
        className="w-full bg-black border-b border-gray-200 hover:bg-gray-800 transition-colors duration-200 py-2 group"
        data-auto-id="header-promo-callout"
        data-testid="usp-wrapper"
        aria-label="usp-bar.open"
      >
        <div data-testid="transition-group" className="w-full">
          <div data-testid="usp-header-item" className="w-full">
            <div className="flex items-center justify-center space-x-2 px-4" data-testid="usp-item">
              <div className="text-sm font-medium text-white uppercase tracking-wide">
                CHELSEA FC
              </div>
              <span title="" className="flex items-center transition-transform duration-200 group-hover:rotate-180" role="img">
                <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
              </span>
            </div>
          </div>
        </div>
      </button>

      {/* Header Container */}
      <div className="max-w-7xl mx-auto">
        {/* Top Navigation */}
        <nav className="hidden md:block border-b border-gray-100" aria-label="Customer information">
          <ul className="flex justify-end space-x-6 py-2 px-4 text-sm" data-auto-id="header-top">
            <li><a href="#" className="text-gray-700 hover:text-gray-900 transition-colors duration-200">ayuda</a></li>
            <li><a href="#" className="text-gray-700 hover:text-gray-900 transition-colors duration-200">pedidos y devoluciones</a></li>
            <li><a href="#" className="text-gray-700 hover:text-gray-900 transition-colors duration-200">tarjetas de regalo</a></li>
            <li><button className="text-gray-700 hover:text-gray-900 transition-colors duration-200">join chelsea fc</button></li>
            <li>
              <button aria-label="Change delivery location or change language" className="flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-200">
                <img alt="bandera mx" src="https://adl-foundation.adidas.com/flags/1-2-1/us.svg" className="w-4 h-3 mr-1" />
              </button>
            </li>
          </ul>
        </nav>

        {/* Main Header */}
        <div className="flex items-center justify-between py-2 px-5" data-auto-id="header-bottom">
          {/* Logo */}
          <a href="#" aria-label="Homepage" className="flex items-center hover:opacity-80 transition-opacity duration-200" data-auto-id="logo">
            <img src="/Main_Website_Badge_-_Colour.webp" alt="Mexico Flag" className="w-10 h-10" />
          </a>

          {/* Carrossel de mensagens */}
          <div className="flex-1 mx-8">
            <HeaderCarousel />
          </div>

          {/* Ícones à direita */}
          

            {/* Heart Icon */}
            <HeartIcon
              isLiked={isLiked}
              onClick={() => {
                setIsLiked(!isLiked);
              }}
            />   
        </div>
      </div>
    </header>
  );
};

// Remover o MinimalHeader e USPHeader antigos e usar apenas o CompleteHeader
export default function PSGQuiz() {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUSPPanel, setShowUSPPanel] = useState(false);

  // Usar o hook de captura do ttclid
  console.log('[PSGQuiz] Chamando useTikTokClickIdCapture...')
  useTikTokClickIdCapture();
  console.log('[PSGQuiz] useTikTokClickIdCapture chamado')

  const isPixelsReady = usePixelLoader()
  const { playSound, isInitialized: audioInitialized } = useAudioSystem();
  const [progressValue, setProgressValue] = useState(100);
  const progressTimer = useRef<NodeJS.Timeout | null>(null);

  // Remover o useEffect que adiciona os estilos
  useEffect(() => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
    }

    if (gameStarted && !quizCompleted) {
      progressTimer.current = setInterval(() => {
        setProgressValue(prev => {
          const newValue = prev - 1;
          if (newValue <= 0) {
            if (progressTimer.current) {
              clearInterval(progressTimer.current);
            }
            // Avança automaticamente para a próxima pergunta quando o tempo acabar
            handleAnswer();
            return 100;
          }
          return newValue;
        });
      }, 100); // 10 segundos total (100 * 100ms = 10000ms)
    }

    return () => {
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
      }
    };
  }, [gameStarted, currentQuestion, quizCompleted]);

  // Reset progress quando mudar de pergunta
  useEffect(() => {
    setProgressValue(100);
    
    // Rastrear visualização da pergunta quando gameStarted está true
    if (gameStarted && !quizCompleted) {
      trackQuizStep('question_viewed', currentQuestion + 1);
    }
  }, [currentQuestion, gameStarted, quizCompleted]);

  // Debug para verificar o estado
  useEffect(() => {
    console.log('showUSPPanel state changed:', showUSPPanel)
  }, [showUSPPanel])

  // Usar o hook de delay
  useDelayedElements()

  // Função para abrir o painel USP
  const handleUSPClick = () => {
    console.log('handleUSPClick called')
    setShowUSPPanel(true)
  }

  // Função para fechar o painel USP
  const handleUSPClose = () => {
    console.log('handleUSPClose called')
    setShowUSPPanel(false)
  }

  // Modificar a função de início do quiz com loading
  const handleStartQuiz = () => {
    setIsLoading(true)
    trackQuizStep('quiz_start'); // Rastrear início do quiz
    
    // Simular um pequeno delay para melhor UX
    setTimeout(() => {
      setGameStarted(true)
      setIsLoading(false)
    }, 800)
  }

  // Função para lidar com o clique no botão de compra
  const handleBuyNowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    trackQuizStep('go_to_store'); // Evento final - ir para a loja
    const newWindow = window.open("https://www.chelseafcstore.shop/", "_blank");
    if (newWindow) newWindow.opener = null;
  }

  // Modificar a função de resposta com loading
  const handleAnswer = () => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    const isCorrect = Number.parseInt(selectedAnswer) === questions[currentQuestion].correct
    const questionNumber = currentQuestion + 1

    // Sempre incrementar o contador, independente da resposta estar correta
    setCorrectAnswers(prev => {
      const newValue = prev + 1;
      console.log('Desconto atualizado:', newValue);
      return newValue;
    });

    // Tracking de eventos - rastrear cada pergunta
    trackQuizStep('question_answered', questionNumber, isCorrect);
    
    // Sempre mostrar a notificação
    setShowNotification(true);
    playSound();

    // Avançar diretamente para a próxima pergunta ou finalizar o quiz
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1)
        setSelectedAnswer("")
      } else {
        setQuizCompleted(true)
        trackQuizStep('quiz_completed'); // Rastrear conclusão do quiz
      }
      setIsSubmitting(false)
    }, 600)
  }

  // Modificar nextQuestion com loading
  const nextQuestion = () => {
    setIsLoading(true)
    
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1)
        setSelectedAnswer("")
      } else {
        setQuizCompleted(true)
        trackQuizStep('quiz_completed'); // Rastrear conclusão do quiz
      }
      setIsLoading(false)
    }, 400)
  }

  const handleRestart = () => {
    trackQuizStep('quiz_restart'); // Rastrear reinício do quiz
    setGameStarted(false);
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setCorrectAnswers(0);
    setQuizCompleted(false);
    setShowNotification(false);
  };

  const discount = correctAnswers * 25
  const originalPrice = 150.0
  const finalPrice = Math.max(originalPrice - discount, 50.0)

  useTrackVSLView();

  // Rastrear visualização da página final
  useEffect(() => {
    if (quizCompleted) {
      trackQuizStep('final_page_viewed');
    }
  }, [quizCompleted]);

  // Initial screen with the president
  if (!gameStarted) {
    return (
      <>
        <div className="min-h-screen bg-white flex flex-col">
          <CompleteHeader onUSPClick={handleUSPClick} />
          <USPPanel isOpen={showUSPPanel} onClose={handleUSPClose} />
          <div className="flex-grow">
            <div className="container mx-auto px-4 py-8">
              <div className="text-center mb-10 animate-fadeIn">
                <h1 className="text-4xl font-normal font-product-sans text-gray-900">Message from Chelsea FC</h1>
              </div>
              
              <div className="space-y-8">
                <div className="animate-scaleIn">
                  <VideoPlayer isReady={true} />
                </div>

                <LikeSystem />

                <div className="bg-black/70 p-5 rounded-xl border shadow-sm animate-slideIn">
                  <blockquote className="text-sm md:text-lg text-white italic text-center leading-relaxed">
                    "Answer the 4 questions and get up to £100 off the signed jersey!"
                  </blockquote>
                </div>



                <Button
                  onClick={handleStartQuiz}
                  disabled={isLoading}
                  className="w-full bg-green-500 hover:bg-gray-800 disabled:bg-gray-400 text-white text-xl py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="md" />
                      Starting Quiz...
                    </>
                  ) : (
                    <>
                      <Trophy className="h-6 w-6" />
                      Start Quiz
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
          <PartnersFooter />
        </div>
      </>
    );
  }

  if (quizCompleted) {
    return (
      <>
        <div className="min-h-screen bg-white flex flex-col">
          <CompleteHeader onUSPClick={handleUSPClick} />
          <USPPanel isOpen={showUSPPanel} onClose={handleUSPClose} />
          <div className="flex-grow container mx-auto px-4 py-8">
            <div className="space-y-8">
              <div className="transform transition-all duration-500 hover:scale-105">
                <PriceAnchoring correctAnswers={4} />
              </div>

              <div className="flex flex-col gap-4">
                <Button
                  className="bg-blue-800 hover:bg-blue-900 text-white w-full py-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  size="lg"
                  onClick={handleBuyNowClick}
                >
                  <DollarSign className="mr-2 h-5 w-5" />
                  Buy Now
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="w-full border-2 hover:bg-gray-50 transition-all duration-200 py-6" 
                  onClick={handleRestart}
                >
                  🔄 Try Again
                </Button>
              </div>
            </div>
          </div>
          <PartnersFooter />
        </div>
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col">
        <CompleteHeader onUSPClick={handleUSPClick} />
        <USPPanel isOpen={showUSPPanel} onClose={handleUSPClose} />
        <div className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center" style={{ minHeight: 'calc(100vh - 140px)' }}>
          <SuccessNotification show={showNotification} onClose={() => setShowNotification(false)} />

          <div className="w-full max-w-2xl">
            <div className="mb-8 animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden ring-2 ring-blue-200">
                    <Image
                      src="images/chelsea-shirt.jpg"
                      alt="Chelsea Official Jersey"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Chelsea Fan Quiz</h2>
                    <p className="text-gray-600">
                      Question {currentQuestion + 1} of {questions.length}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Your discount</p>
                  <p className={`mr-10 text-2xl font-bold text-green-600 transform transition-all duration-500 ${
                    correctAnswers > 0 ? 'scale-125 animate-pulse' : ''
                  }`}>
                    £{correctAnswers * 25}
                  </p>
                  <p className="text-xs text-gray-500">Participation reward</p>
                </div>
              </div>
              {gameStarted && !quizCompleted && (
                <div className="progress-container">
                  <div
                    className="progress-bar"
                    style={{ width: `${progressValue}%` }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div className="animate-slideIn">
                <div className="bg-gray-50 p-8 rounded-xl border shadow-sm transition-all duration-300 hover:shadow-md mb-6">
                  <h3 className="text-xl font-semibold mb-6 text-gray-900">{questions[currentQuestion].question}</h3>

                  <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} className="space-y-4">
                    {questions[currentQuestion].options.map((option, index) => (
                      <div
                        key={index}
                        className={`flex items-center space-x-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                          selectedAnswer === index.toString() 
                            ? 'bg-gray-50 border-gray-300 shadow-sm transform scale-105' 
                            : 'hover:bg-gray-100 border-gray-200 hover:transform hover:scale-102'
                        }`}
                      >
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer font-medium">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <Button
                  onClick={handleAnswer}
                  disabled={!selectedAnswer || isSubmitting}
                  className={`w-full py-6 text-white transition-all duration-200 transform hover:scale-105 ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-black hover:bg-gray-800 hover:shadow-lg'
                  }`}
                  size="lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      Processing...
                    </div>
                  ) : (
                    "Confirm Answer"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <PartnersFooter />
      </div>
    </>
  )
}