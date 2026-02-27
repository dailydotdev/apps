import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { isSameDay, subDays } from 'date-fns';
import { useAuthContext } from '../../contexts/AuthContext';
import { useReadingStreak } from '../../hooks/streaks/useReadingStreak';
import { isSameDayInTimezone } from '../../lib/timezones';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import type { ReadingDay } from '../../graphql/users';
import { getReadingStreak30Days } from '../../graphql/users';
import { isWeekend as isWeekendDay } from '../../lib/date';
import { useStreakDebug } from '../../hooks/streaks/useStreakDebug';
import { ThemeMode, useSettingsContext } from '../../contexts/SettingsContext';

const previewDays = 7;

type GreetingMoment = 'morning' | 'afternoon' | 'evening';

const getGreetingMoment = (date: Date): GreetingMoment => {
  const hour = date.getHours();

  if (hour < 12) {
    return 'morning';
  }

  if (hour < 18) {
    return 'afternoon';
  }

  return 'evening';
};

const greetingByMoment: Record<GreetingMoment, string> = {
  morning: 'Good morning',
  afternoon: 'Good afternoon',
  evening: 'Good evening',
};

const generateDummyReadDays = (
  streakCount: number,
  anchorDate: Date,
  weekStart: number | undefined,
  timezone: string | undefined,
): Set<string> => {
  const result = new Set<string>();
  let remaining = streakCount;
  let cursor = anchorDate;

  while (remaining > 0) {
    if (!isWeekendDay(cursor, weekStart, timezone)) {
      result.add(cursor.toDateString());
      remaining -= 1;
    }
    cursor = subDays(cursor, 1);
  }

  return result;
};

export function FeedGreetingHero(): ReactElement | null {
  const { user } = useAuthContext();
  const { themeMode } = useSettingsContext();
  const { streak, isLoading, isStreaksEnabled } = useReadingStreak();
  const {
    debugStreakOverride,
    isDebugMode,
    isFeedHeroVisible,
    feedHeroVariantOverride,
  } = useStreakDebug();
  const { data: history } = useQuery<ReadingDay[]>({
    queryKey: generateQueryKey(RequestKey.ReadingStreak30Days, user),
    queryFn: () => getReadingStreak30Days(user?.id),
    staleTime: StaleTime.Default,
    enabled: !!user?.id && isStreaksEnabled,
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isSystemDark, setIsSystemDark] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (themeMode !== ThemeMode.Auto || typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemTheme = (event?: MediaQueryListEvent): void => {
      setIsSystemDark(event?.matches ?? mediaQuery.matches);
    };

    updateSystemTheme();
    mediaQuery.addEventListener('change', updateSystemTheme);

    return () => {
      mediaQuery.removeEventListener('change', updateSystemTheme);
    };
  }, [themeMode]);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const greetingMoment = useMemo(() => {
    if (isDebugMode && feedHeroVariantOverride === 'night') {
      return 'evening';
    }

    if (isDebugMode && feedHeroVariantOverride === 'morning') {
      return 'morning';
    }

    return getGreetingMoment(new Date());
  }, [feedHeroVariantOverride, isDebugMode]);
  const greeting = greetingByMoment[greetingMoment];
  const isEvening = greetingMoment === 'evening';
  const isMorning = greetingMoment === 'morning';

  const effectiveStreak = debugStreakOverride ?? streak?.current ?? 0;
  const hasReadToday =
    !!streak?.lastViewAt &&
    isSameDayInTimezone(new Date(streak.lastViewAt), new Date(), user?.timezone);
  const completedBeforeToday = hasReadToday
    ? Math.max(effectiveStreak - 1, 0)
    : effectiveStreak;
  const previewDaysDates = useMemo(() => {
    const half = Math.floor(previewDays / 2);
    return Array.from({ length: previewDays }, (_, index) => {
      const offset = index - half; // -3, -2, -1, 0, 1, 2, 3
      return offset < 0 ? subDays(new Date(), Math.abs(offset)) : offset > 0 ? new Date(new Date().setDate(new Date().getDate() + offset)) : new Date();
    });
  }, []);
  const readDaysSet = useMemo(() => {
    if (!history) {
      return new Set<string>();
    }

    return new Set(
      history
        .filter((day) => day.reads > 0)
        .map((day) => new Date(day.date).toDateString()),
    );
  }, [history]);
  const debugReadDaysSet = useMemo(() => {
    if (debugStreakOverride === null) {
      return null;
    }

    return generateDummyReadDays(
      debugStreakOverride,
      new Date(),
      streak?.weekStart,
      user?.timezone,
    );
  }, [debugStreakOverride, streak?.weekStart, user?.timezone]);
  const dayLabel = effectiveStreak === 1 ? 'day' : 'days';

  if (
    !user ||
    isLoading ||
    (!isDebugMode && isEvening && themeMode === ThemeMode.Light) ||
    (!isDebugMode &&
      isEvening &&
      themeMode === ThemeMode.Auto &&
      !isSystemDark) ||
    !isStreaksEnabled ||
    !streak ||
    (isDebugMode && !isFeedHeroVisible) ||
    (!isDebugMode && hasReadToday && effectiveStreak > 0)
  ) {
    return null;
  }

  return (
    <section
      className={classNames(
        'relative mb-4 w-full overflow-hidden rounded-24 bg-background-default',
        'p-5 tablet:p-6',
        'transition-all duration-500 ease-out motion-reduce:transition-none',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent-bacon-default/15 via-transparent to-accent-onion-default/20" />
      <div
        className={classNames(
          'pointer-events-none absolute inset-0 z-0',
          isEvening
            ? 'bg-[#02040a]'
            : 'bg-gradient-to-b from-[#1b2134]/35 via-[#1b2134]/15 to-transparent',
        )}
      />
      
      <style>{`
            @keyframes butterfly-flutter {
              0%, 100% { transform: scaleX(1) translateY(0); }
              50% { transform: scaleX(0.2) translateY(-2px); }
            }
        @keyframes butterfly-float-1 {
          0% { transform: translate(0, 0) scale(0.8) rotate(15deg); opacity: 0; }
          20% { opacity: 0.8; }
          50% { transform: translate(15px, -20px) scale(1) rotate(25deg); opacity: 1; }
          80% { opacity: 0.8; }
          100% { transform: translate(30px, -40px) scale(0.8) rotate(15deg); opacity: 0; }
        }
        @keyframes butterfly-float-2 {
          0% { transform: translate(0, 0) scale(0.8) rotate(-15deg); opacity: 0; }
          20% { opacity: 0.7; }
          50% { transform: translate(-20px, -15px) scale(1.1) rotate(-25deg); opacity: 1; }
          80% { opacity: 0.7; }
          100% { transform: translate(-40px, -30px) scale(0.8) rotate(-15deg); opacity: 0; }
        }
        @keyframes butterfly-float-3 {
          0% { transform: translate(0, 0) scale(0.8) rotate(45deg); opacity: 0; }
          20% { opacity: 0.6; }
          50% { transform: translate(-15px, -30px) scale(1) rotate(20deg); opacity: 0.9; }
          80% { opacity: 0.6; }
          100% { transform: translate(-30px, -60px) scale(0.8) rotate(45deg); opacity: 0; }
        }
        @keyframes anime-ray-pulse {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 1; }
        }
        @keyframes anime-dust-float {
          0% { transform: translate(0, 0) scale(0.5); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translate(25px, -40px) scale(1.2); opacity: 0; }
        }
        .animate-butterfly-1 { animation: butterfly-float-1 6s ease-in-out infinite; }
        .animate-butterfly-2 { animation: butterfly-float-2 8s ease-in-out infinite; animation-delay: 2s; }
        .animate-butterfly-3 { animation: butterfly-float-3 7s ease-in-out infinite; animation-delay: 4s; }
        .animate-butterfly-wing { animation: butterfly-flutter 0.15s ease-in-out infinite; }
        .animate-anime-ray-1 { animation: anime-ray-pulse 6s ease-in-out infinite; }
        .animate-anime-ray-2 { animation: anime-ray-pulse 8s ease-in-out infinite 1s; }
        .animate-anime-ray-3 { animation: anime-ray-pulse 7s ease-in-out infinite 2s; }
        .animate-anime-ray-4 { animation: anime-ray-pulse 9s ease-in-out infinite 1.5s; }
      `}</style>

      {!isEvening && (
        <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden">
          {/* Sunrise anime sky wash (blue -> pink -> gold) */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#ffd99e]/90 via-[#e098a3]/80 to-[#7f90b8]/90" />
          
          {/* Additional bottom purple/blue cloud glow */}
          <div className="absolute -bottom-20 -left-10 h-64 w-96 rounded-full bg-[#706b96]/60 blur-[80px]" />

          {/* Strong fallback beam so rays are always visible */}
          <div className="absolute -left-[10%] -top-[30%] h-[200%] w-[50%] rotate-[35deg] bg-gradient-to-b from-[#ffe7a0]/90 via-[#ffb973]/50 to-transparent blur-3xl" />

          {/* Strong parallel window rays from top-left */}
          <div className="absolute -left-[20%] -top-[55%] h-[240%] w-[180%] rotate-[35deg] transform-gpu">
            <div className="absolute left-[12%] top-0 h-full w-24 bg-gradient-to-b from-[#fff3cd]/95 via-[#ffc677]/60 to-transparent blur-xl animate-anime-ray-1" />
            <div className="absolute left-[24%] top-0 h-full w-16 bg-gradient-to-b from-white/90 via-[#ffba6b]/50 to-transparent blur-lg animate-anime-ray-2" />
            <div className="absolute left-[33%] top-0 h-full w-32 bg-gradient-to-b from-[#ffedba]/85 via-[#ffa75e]/45 to-transparent blur-2xl animate-anime-ray-3" />
            <div className="absolute left-[45%] top-0 h-full w-14 bg-gradient-to-b from-white/85 via-[#ffcf85]/40 to-transparent blur-md animate-anime-ray-4" />
            <div className="absolute left-[52%] top-0 h-full w-40 bg-gradient-to-b from-[#ffe094]/80 via-[#ff9c54]/30 to-transparent blur-[32px] animate-anime-ray-2" />
          </div>

          {/* Floating light particles in the rays */}
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={`dust-${i}`}
              className="absolute rounded-full bg-[#fffcf2] blur-[0.5px]"
              style={{
                left: `${10 + Math.random() * 75}%`,
                top: `${8 + Math.random() * 80}%`,
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
                boxShadow: '0 0 10px 1px rgba(255, 240, 180, 0.9)',
                animation: `anime-dust-float ${4 + Math.random() * 5}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 4}s`,
              }}
            />
          ))}

          {/* Warm source glow */}
          <div className="absolute -left-32 -top-32 h-[35rem] w-[35rem] rounded-full bg-[#ffea9e]/60 blur-[100px]" />
        </div>
      )}
      {isEvening && (
        <>
          <style>{`
            @keyframes shooting-star {
              0% {
                transform: translate3d(0, 0, 0) rotate(-45deg);
                opacity: 1;
              }
              10% {
                transform: translate3d(-1000px, 1000px, 0) rotate(-45deg);
                opacity: 0;
              }
              100% {
                transform: translate3d(-1000px, 1000px, 0) rotate(-45deg);
                opacity: 0;
              }
            }
            .animate-shooting-star {
              animation: shooting-star 10s linear infinite;
            }
            .animate-shooting-star-green {
              animation: shooting-star 25s linear infinite;
              animation-delay: 5s;
            }
            @keyframes starlink-train {
              0% {
                left: -20%;
                top: 120%;
                opacity: 0;
              }
              5% {
                opacity: 0.6;
              }
              45% {
                opacity: 0.6;
              }
              50% {
                left: 120%;
                top: -20%;
                opacity: 0;
              }
              100% {
                left: 120%;
                top: -20%;
                opacity: 0;
              }
            }
            .animate-starlink {
              animation: starlink-train 80s linear 20s infinite;
            }
          `}</style>
          {/* Deep space background gradients */}
          <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,rgba(15,25,60,0.8)_0%,transparent_60%)]" />
          <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(20,10,40,0.9)_0%,transparent_50%)]" />
          
          {/* Milky way core band */}
          <div className="pointer-events-none absolute -inset-[20%] z-0 rotate-[15deg] bg-[radial-gradient(ellipse_at_center,rgba(60,40,110,0.25)_0%,rgba(30,40,90,0.15)_30%,transparent_65%)] blur-2xl" />
          <div className="pointer-events-none absolute -inset-[10%] z-0 rotate-[15deg] bg-[radial-gradient(ellipse_at_center,rgba(120,70,160,0.15)_0%,rgba(50,80,140,0.1)_40%,transparent_70%)] blur-xl" />
          
          {/* Nebula dust clouds */}
          <div className="pointer-events-none absolute -left-10 top-10 z-0 h-64 w-96 rounded-full bg-accent-onion-default/15 blur-[64px]" />
          <div className="pointer-events-none absolute -right-20 top-0 z-0 h-80 w-[30rem] rounded-full bg-accent-bacon-default/10 blur-[80px]" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 z-0 h-40 w-64 rounded-full bg-[#2a4b8d]/20 blur-[50px]" />

          {/* Falling stars */}
          <div className="absolute right-[20%] top-0 z-0 h-[1px] w-32 animate-shooting-star bg-gradient-to-r from-white to-transparent opacity-0">
            <div className="absolute left-0 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-white shadow-[0_0_6px_2px_rgba(255,255,255,0.8)]" />
          </div>
          <div className="absolute -top-10 right-[40%] z-0 h-[1.5px] w-48 animate-shooting-star-green bg-gradient-to-r from-[#4ade80] to-transparent opacity-0">
            <div className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#4ade80] shadow-[0_0_12px_4px_rgba(74,222,128,0.8)]" />
          </div>
        </>
      )}
      <div className="pointer-events-none absolute inset-0 z-1">
        {isEvening && (
          <div className="absolute left-[10%] top-[15%] h-40 w-40 rotate-[18deg] opacity-60">
            <svg viewBox="0 0 370 216" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
              <g opacity="0.04">
                <path d="M316.542 104.054L276.986 64.4152L296.753 24.79L361.024 89.1956C369.213 97.4018 369.213 110.707 361.024 118.913L281.919 198.184C273.73 206.39 260.453 206.39 252.264 198.184C244.075 189.978 244.075 176.673 252.264 168.467L316.542 104.054Z" fill="#A8B3CF" fillOpacity="0.64"/>
                <path d="M252.278 10.9093C260.467 2.70308 273.747 2.70652 281.936 10.9127L296.767 25.7747L123.736 199.169C115.547 207.375 102.266 207.371 94.0773 199.165L79.2463 184.303L252.278 10.9093ZM178.12 65.4068L148.458 95.1309L108.901 55.4919L59.4579 105.039L99.0141 144.678L79.2463 184.303L14.9753 119.898C6.78624 111.691 6.78624 98.3865 14.9753 90.1804L94.0773 10.9127C102.266 2.70652 115.547 2.70308 123.736 10.9093L178.12 65.4068Z" fill="white"/>
              </g>
              <path d="M155.5 76.5L109.5 27.5L29.5 104L109.5 184.5L263.5 27.5L345.5 104L264.5 185" stroke="white" strokeWidth="1.5"/>
              <circle cx="109.5" cy="29.5" r="4.5" fill="white" className="drop-shadow-[0_0_6px_rgba(255,255,255,1)]" />
              <circle cx="30.5" cy="104.5" r="7.5" fill="white" className="drop-shadow-[0_0_8px_rgba(255,255,255,1)]" />
              <circle cx="109.5" cy="183.5" r="4.5" fill="white" className="drop-shadow-[0_0_6px_rgba(255,255,255,1)]" />
              <circle cx="263.5" cy="29.5" r="6.5" fill="white" className="drop-shadow-[0_0_8px_rgba(255,255,255,1)]" />
              <circle cx="343.5" cy="104.5" r="3.5" fill="white" className="drop-shadow-[0_0_4px_rgba(255,255,255,1)]" />
              <circle cx="264.5" cy="184.5" r="8.5" fill="white" className="drop-shadow-[0_0_10px_rgba(255,255,255,1)]" />
              <circle cx="154.5" cy="76.5" r="4.5" fill="white" className="drop-shadow-[0_0_6px_rgba(255,255,255,1)]" />
            </svg>
          </div>
        )}
        {[
          // Dense Milky Way band stars
          { left: '15%', top: '65%', size: 1, delay: '0ms', opacity: 'opacity-80' },
          { left: '22%', top: '55%', size: 1.5, delay: '400ms', opacity: 'opacity-90' },
          { left: '28%', top: '45%', size: 2, delay: '800ms', opacity: 'opacity-100' },
          { left: '35%', top: '35%', size: 1, delay: '200ms', opacity: 'opacity-70' },
          { left: '42%', top: '25%', size: 1.5, delay: '600ms', opacity: 'opacity-90' },
          { left: '48%', top: '15%', size: 2.5, delay: '100ms', opacity: 'opacity-100' },
          { left: '55%', top: '22%', size: 1, delay: '900ms', opacity: 'opacity-60' },
          { left: '62%', top: '32%', size: 2, delay: '300ms', opacity: 'opacity-95' },
          { left: '68%', top: '42%', size: 1.5, delay: '700ms', opacity: 'opacity-85' },
          { left: '75%', top: '52%', size: 1, delay: '500ms', opacity: 'opacity-75' },
          
          // Scattered background stars
          { left: '5%', top: '15%', size: 1.5, delay: '150ms', opacity: 'opacity-60' },
          { left: '12%', top: '8%', size: 2, delay: '850ms', opacity: 'opacity-80' },
          { left: '8%', top: '85%', size: 1, delay: '450ms', opacity: 'opacity-50' },
          { left: '18%', top: '90%', size: 2.5, delay: '50ms', opacity: 'opacity-90' },
          { left: '30%', top: '10%', size: 1, delay: '750ms', opacity: 'opacity-40' },
          { left: '45%', top: '80%', size: 2, delay: '250ms', opacity: 'opacity-85' },
          { left: '58%', top: '85%', size: 1.5, delay: '950ms', opacity: 'opacity-70' },
          { left: '70%', top: '12%', size: 2.5, delay: '350ms', opacity: 'opacity-95' },
          { left: '82%', top: '20%', size: 1, delay: '650ms', opacity: 'opacity-55' },
          { left: '88%', top: '75%', size: 2, delay: '100ms', opacity: 'opacity-80' },
          { left: '95%', top: '40%', size: 1.5, delay: '550ms', opacity: 'opacity-65' },
          { left: '92%', top: '85%', size: 1, delay: '850ms', opacity: 'opacity-45' },
          
          // Tiny dust stars
          { left: '25%', top: '50%', size: 0.5, delay: '100ms', opacity: 'opacity-40' },
          { left: '32%', top: '40%', size: 0.5, delay: '300ms', opacity: 'opacity-50' },
          { left: '45%', top: '30%', size: 0.5, delay: '500ms', opacity: 'opacity-45' },
          { left: '52%', top: '20%', size: 0.5, delay: '700ms', opacity: 'opacity-55' },
          { left: '65%', top: '35%', size: 0.5, delay: '900ms', opacity: 'opacity-40' },
        ].map((star) => (
          <span
            key={`${star.left}-${star.top}`}
            className={classNames(
              'absolute rounded-full',
              isEvening
                ? `bg-white ${star.opacity} animate-streak-star-twinkle`
                : 'bg-white/65 drop-shadow-[0_0_4px_rgba(255,255,255,0.45)]',
            )}
            style={{
              left: star.left,
              top: star.top,
              width: `${star.size.toString()}px`,
              height: `${star.size.toString()}px`,
              animationDelay: star.delay,
              animationDuration: `${(3 + Math.random() * 4).toFixed(1)}s`,
              boxShadow: isEvening && star.size > 1.5 ? '0 0 8px 1px rgba(255,255,255,0.8)' : 'none',
            }}
          />
        ))}
      </div>
      {isEvening && (
        <div className="pointer-events-none absolute inset-0 z-2 overflow-hidden">
          <div className="absolute flex items-center gap-1 opacity-0 animate-starlink" style={{ transform: 'rotate(-20deg)' }}>
            {Array.from({ length: 15 }).map((_, index) => {
              const opacity = Math.max(0.1, 1 - Math.abs(index - 7) / 7);
              return (
                <span
                  key={`starlink-${index.toString()}`}
                  className="h-[1.5px] w-[1.5px] rounded-full bg-white"
                  style={{
                    opacity,
                    boxShadow: `0 0 ${opacity * 4}px rgba(255,255,255,${opacity})`
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
      
      {/* Ground fog / atmosphere */}
      <div className="pointer-events-none absolute -bottom-12 left-0 right-0 z-0 h-48 bg-gradient-to-t from-background-default via-background-default/80 to-transparent blur-xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-0 h-24 bg-gradient-to-t from-background-default to-transparent" />

      <div className="relative z-10 mt-12 flex flex-col items-center text-center">
        <p 
          className={classNames(
            "relative inline-block font-bold text-text-primary typo-giga3 tablet:typo-giga2 [font-family:Pacifico,cursive]",
            "transition-opacity duration-[2000ms] ease-in-out",
            isVisible ? "opacity-100" : "opacity-0"
          )}
        >
          {isMorning && (
            <>
              {/* Butterfly 1 (Top Right) */}
              <span className="absolute -right-12 -top-6 z-10 h-6 w-6 animate-butterfly-1 text-[#c084fc] opacity-0 drop-shadow-[0_0_12px_rgba(192,132,252,0.9)] blur-[0.5px]">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full animate-butterfly-wing origin-center">
                  <path d="M19.78,3.2C19.34,3.23 18.57,3.61 17.65,4.35C15.65,5.95 13.91,8.39 12,11.5C10.09,8.39 8.35,5.95 6.35,4.35C5.43,3.61 4.66,3.23 4.22,3.2C3.16,3.15 2.19,3.94 2.05,5C1.86,6.46 2.82,8.44 4.54,10.66C5.9,12.43 7.82,14 10.35,15.11C9.69,15.82 8.79,16.59 7.64,17.38C6.06,18.47 4.5,19.32 4.14,19.53C3.96,19.64 3.86,19.83 3.86,20.03C3.86,20.46 4.31,20.74 4.69,20.55C4.78,20.5 6.42,19.57 8.16,18.39C9.79,17.29 11.23,16 12,15C12.77,16 14.21,17.29 15.84,18.39C17.58,19.57 19.22,20.5 19.31,20.55C19.69,20.74 20.14,20.46 20.14,20.03C20.14,19.83 20.04,19.64 19.86,19.53C19.5,19.32 17.94,18.47 16.36,17.38C15.21,16.59 14.31,15.82 13.65,15.11C16.18,14 18.1,12.43 19.46,10.66C21.18,8.44 22.14,6.46 21.95,5C21.81,3.94 20.84,3.15 19.78,3.2Z" />
                </svg>
              </span>
              {/* Butterfly 2 (Bottom Left) */}
              <span className="absolute -bottom-4 -left-10 z-10 h-5 w-5 animate-butterfly-2 text-[#a855f7] opacity-0 drop-shadow-[0_0_10px_rgba(168,85,247,0.9)] blur-[0.5px]">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full animate-butterfly-wing origin-center" style={{ animationDelay: '0.05s' }}>
                  <path d="M19.78,3.2C19.34,3.23 18.57,3.61 17.65,4.35C15.65,5.95 13.91,8.39 12,11.5C10.09,8.39 8.35,5.95 6.35,4.35C5.43,3.61 4.66,3.23 4.22,3.2C3.16,3.15 2.19,3.94 2.05,5C1.86,6.46 2.82,8.44 4.54,10.66C5.9,12.43 7.82,14 10.35,15.11C9.69,15.82 8.79,16.59 7.64,17.38C6.06,18.47 4.5,19.32 4.14,19.53C3.96,19.64 3.86,19.83 3.86,20.03C3.86,20.46 4.31,20.74 4.69,20.55C4.78,20.5 6.42,19.57 8.16,18.39C9.79,17.29 11.23,16 12,15C12.77,16 14.21,17.29 15.84,18.39C17.58,19.57 19.22,20.5 19.31,20.55C19.69,20.74 20.14,20.46 20.14,20.03C20.14,19.83 20.04,19.64 19.86,19.53C19.5,19.32 17.94,18.47 16.36,17.38C15.21,16.59 14.31,15.82 13.65,15.11C16.18,14 18.1,12.43 19.46,10.66C21.18,8.44 22.14,6.46 21.95,5C21.81,3.94 20.84,3.15 19.78,3.2Z" />
                </svg>
              </span>
              {/* Butterfly 3 (Top Left) */}
              <span className="absolute -left-4 -top-8 z-10 h-4 w-4 animate-butterfly-3 text-[#d8b4fe] opacity-0 drop-shadow-[0_0_8px_rgba(216,180,254,0.9)] blur-[0.5px]">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full animate-butterfly-wing origin-center" style={{ animationDelay: '0.1s' }}>
                  <path d="M19.78,3.2C19.34,3.23 18.57,3.61 17.65,4.35C15.65,5.95 13.91,8.39 12,11.5C10.09,8.39 8.35,5.95 6.35,4.35C5.43,3.61 4.66,3.23 4.22,3.2C3.16,3.15 2.19,3.94 2.05,5C1.86,6.46 2.82,8.44 4.54,10.66C5.9,12.43 7.82,14 10.35,15.11C9.69,15.82 8.79,16.59 7.64,17.38C6.06,18.47 4.5,19.32 4.14,19.53C3.96,19.64 3.86,19.83 3.86,20.03C3.86,20.46 4.31,20.74 4.69,20.55C4.78,20.5 6.42,19.57 8.16,18.39C9.79,17.29 11.23,16 12,15C12.77,16 14.21,17.29 15.84,18.39C17.58,19.57 19.22,20.5 19.31,20.55C19.69,20.74 20.14,20.46 20.14,20.03C20.14,19.83 20.04,19.64 19.86,19.53C19.5,19.32 17.94,18.47 16.36,17.38C15.21,16.59 14.31,15.82 13.65,15.11C16.18,14 18.1,12.43 19.46,10.66C21.18,8.44 22.14,6.46 21.95,5C21.81,3.94 20.84,3.15 19.78,3.2Z" />
                </svg>
              </span>
            </>
          )}
          {greeting}
        </p>
        <p 
          className={classNames(
            "mt-4 max-w-[36rem] text-text-tertiary typo-callout",
            "transition-opacity duration-[2000ms] ease-in-out delay-500",
            isVisible ? "opacity-100" : "opacity-0"
          )}
        >
          {effectiveStreak}-{dayLabel} streak. Keep it going today.
        </p>
      </div>

      <div className="relative z-10 mt-6">
        <div className="flex items-end justify-center gap-2">
          {Array.from({ length: previewDays }).map((_, index) => {
            const day = previewDaysDates[index];
            const isToday = index === Math.floor(previewDays / 2);
            const isWeekend = isWeekendDay(day, streak.weekStart, user.timezone);
            const hasDebugOverride = !!debugReadDaysSet;
            const historyHasData = readDaysSet.size > 0;
            
            let isCompleted = false;
            if (isToday) {
              isCompleted = false; // Hero is meant to prompt reading today, so today is always shown as incomplete
            } else if (index < Math.floor(previewDays / 2)) {
              // Past days
              isCompleted = hasDebugOverride
                ? !isWeekend && debugReadDaysSet.has(day.toDateString())
                : historyHasData
                  ? !isWeekend && readDaysSet.has(day.toDateString())
                  : Math.floor(previewDays / 2) - index <= completedBeforeToday;
            } else {
              // Future days
              isCompleted = false;
            }

            return (
              <span
                key={`streak-preview-${index.toString()}`}
                className={classNames(
                  'relative flex h-5 w-5 items-center justify-center rounded-full border border-border-subtlest-tertiary bg-surface-subtle',
                  isWeekend &&
                    'bg-surface-float text-border-subtlest-tertiary bg-[repeating-linear-gradient(135deg,currentColor_0_2px,transparent_2px_5px)]',
                  isToday && 'border-white ring-2 ring-accent-onion-default/60',
                )}
              >
                {isCompleted && !isWeekend && (
                  <span className="h-[42%] w-[42%] rounded-full bg-accent-bacon-default" />
                )}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
