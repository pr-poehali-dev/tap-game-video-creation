import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Video {
  id: number;
  title: string;
  coins: number;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  target: number;
  unlocked: boolean;
  icon: string;
}

const SAVE_KEY = 'tubecoins_save';

const defaultAchievements: Achievement[] = [
  { id: 1, title: 'Новичок', description: '10 тапов', target: 10, unlocked: false, icon: 'Hand' },
  { id: 2, title: 'Активист', description: '50 тапов', target: 50, unlocked: false, icon: 'Zap' },
  { id: 3, title: 'Энтузиаст', description: '100 тапов', target: 100, unlocked: false, icon: 'Star' },
  { id: 4, title: 'Профи', description: '500 тапов', target: 500, unlocked: false, icon: 'Award' },
  { id: 5, title: 'Легенда', description: '1000 тапов', target: 1000, unlocked: false, icon: 'Trophy' },
];

const loadGameData = () => {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading game data:', error);
  }
  return null;
};

export default function Index() {
  const savedData = loadGameData();
  
  const [coins, setCoins] = useState(savedData?.coins || 0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isCreatingVideo, setIsCreatingVideo] = useState(false);
  const [videos, setVideos] = useState<Video[]>(savedData?.videos || []);
  const [clickAnimation, setClickAnimation] = useState(false);
  const [floatingCoins, setFloatingCoins] = useState<Array<{id: number, x: number, y: number}>>([]);
  const [upgradeLevel, setUpgradeLevel] = useState(savedData?.upgradeLevel || 0);
  const [coinsPerTap, setCoinsPerTap] = useState(savedData?.coinsPerTap || 1);
  const [upgradeCost, setUpgradeCost] = useState(savedData?.upgradeCost || 100);
  const [showUpgrades, setShowUpgrades] = useState(false);
  
  const [autoIncomeLevel, setAutoIncomeLevel] = useState(savedData?.autoIncomeLevel || 0);
  const [coinsPerSecond, setCoinsPerSecond] = useState(savedData?.coinsPerSecond || 0);
  const [autoIncomeCost, setAutoIncomeCost] = useState(savedData?.autoIncomeCost || 300);
  
  const [totalTaps, setTotalTaps] = useState(savedData?.totalTaps || 0);
  const [achievements, setAchievements] = useState<Achievement[]>(savedData?.achievements || defaultAchievements);
  const [showAchievements, setShowAchievements] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(savedData?.lastSaveTime || Date.now());

  useEffect(() => {
    const gameData = {
      coins,
      videos,
      upgradeLevel,
      coinsPerTap,
      upgradeCost,
      autoIncomeLevel,
      coinsPerSecond,
      autoIncomeCost,
      totalTaps,
      achievements,
      lastSaveTime: Date.now()
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameData));
  }, [coins, videos, upgradeLevel, coinsPerTap, upgradeCost, autoIncomeLevel, coinsPerSecond, autoIncomeCost, totalTaps, achievements]);

  useEffect(() => {
    const checkOfflineEarnings = () => {
      const saved = loadGameData();
      if (saved && saved.coinsPerSecond > 0) {
        const timeAway = Math.floor((Date.now() - (saved.lastSaveTime || Date.now())) / 1000);
        if (timeAway > 0 && timeAway < 86400) {
          const offlineEarnings = Math.floor(timeAway * saved.coinsPerSecond);
          if (offlineEarnings > 0) {
            setCoins(prev => prev + offlineEarnings);
            const minutes = Math.floor(timeAway / 60);
            const hours = Math.floor(minutes / 60);
            const timeText = hours > 0 ? `${hours}ч ${minutes % 60}м` : `${minutes}м`;
            toast.success('Добро пожаловать! 🎮', {
              description: `Пока вас не было заработано: ${offlineEarnings} монет (${timeText})`,
              duration: 5000
            });
          }
        }
      }
    };
    checkOfflineEarnings();
  }, []);

  useEffect(() => {
    if (coinsPerSecond > 0) {
      const interval = setInterval(() => {
        setCoins(prev => prev + coinsPerSecond);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [coinsPerSecond]);

  useEffect(() => {
    achievements.forEach(achievement => {
      if (!achievement.unlocked && totalTaps >= achievement.target) {
        setAchievements(prev => 
          prev.map(a => a.id === achievement.id ? { ...a, unlocked: true } : a)
        );
        const reward = achievement.target * 2;
        setCoins(prev => prev + reward);
        toast.success(`Достижение разблокировано! 🏆`, {
          description: `${achievement.title}: +${reward} монет`
        });
      }
    });
  }, [totalTaps, achievements]);

  const handleTap = () => {
    setCoins(prev => prev + coinsPerTap);
    setTotalTaps(prev => prev + 1);
    setClickAnimation(true);
    setTimeout(() => setClickAnimation(false), 300);
    
    const newCoin = {
      id: Date.now(),
      x: Math.random() * 200 - 100,
      y: Math.random() * 50
    };
    setFloatingCoins(prev => [...prev, newCoin]);
    setTimeout(() => {
      setFloatingCoins(prev => prev.filter(c => c.id !== newCoin.id));
    }, 1000);
  };

  const handleUpgrade = () => {
    if (coins < upgradeCost) {
      toast.error('Недостаточно монет!', {
        description: `Нужно ещё ${upgradeCost - coins} TubeCoins`
      });
      return;
    }

    setCoins(prev => prev - upgradeCost);
    setUpgradeLevel(prev => prev + 1);
    
    const newCoinsPerTap = upgradeLevel === 0 ? 50 : coinsPerTap + 250;
    const newUpgradeCost = upgradeLevel === 0 ? 500 : upgradeCost + 500;
    
    setCoinsPerTap(newCoinsPerTap);
    setUpgradeCost(newUpgradeCost);
    
    toast.success('Улучшение куплено! 🚀', {
      description: `Теперь за тап: ${newCoinsPerTap} монет`
    });
  };

  const handleAutoIncomeUpgrade = () => {
    if (coins < autoIncomeCost) {
      toast.error('Недостаточно монет!', {
        description: `Нужно ещё ${autoIncomeCost - coins} TubeCoins`
      });
      return;
    }

    setCoins(prev => prev - autoIncomeCost);
    setAutoIncomeLevel(prev => prev + 1);
    
    const newCoinsPerSecond = autoIncomeLevel === 0 ? 5 : coinsPerSecond + 10;
    const newAutoIncomeCost = autoIncomeLevel === 0 ? 800 : autoIncomeCost + 700;
    
    setCoinsPerSecond(newCoinsPerSecond);
    setAutoIncomeCost(newAutoIncomeCost);
    
    toast.success('Автодоход куплен! ⚡', {
      description: `Теперь в секунду: ${newCoinsPerSecond} монет`
    });
  };

  const handleCreateVideo = () => {
    if (isCreatingVideo) return;
    
    setIsCreatingVideo(true);
    setVideoProgress(0);
    
    const interval = setInterval(() => {
      setVideoProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          const newVideo: Video = {
            id: Date.now(),
            title: `Видео #${videos.length + 1}`,
            coins: Math.floor(Math.random() * 50) + 10
          };
          setVideos(prevVideos => [...prevVideos, newVideo]);
          setIsCreatingVideo(false);
          toast.success('Видео создано!', {
            description: `Опубликуйте его чтобы получить ${newVideo.coins} TubeCoins`
          });
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const handlePublishVideo = (video: Video) => {
    setCoins(prev => prev + video.coins);
    setVideos(prevVideos => prevVideos.filter(v => v.id !== video.id));
    
    toast.success('Видео опубликовано! 🎉', {
      description: `+${video.coins} TubeCoins`
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] via-[#2D1B4E] to-[#1A1F2C] flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]" />
      
      <div className="fixed top-4 right-4 z-20 flex gap-2">
        <Button
          onClick={() => setShowAchievements(!showAchievements)}
          className="bg-gradient-to-r from-[#F97316] to-[#D946EF] hover:opacity-90 shadow-2xl relative"
          size="lg"
        >
          <Icon name="Trophy" size={20} className="mr-2" />
          <span className="hidden sm:inline">Достижения</span>
          {achievements.filter(a => a.unlocked).length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full text-xs flex items-center justify-center">
              {achievements.filter(a => a.unlocked).length}
            </span>
          )}
        </Button>
        <Button
          onClick={() => setShowUpgrades(!showUpgrades)}
          className="bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] hover:opacity-90 shadow-2xl"
          size="lg"
        >
          <Icon name="Zap" size={20} className="mr-2" />
          <span className="hidden sm:inline">Улучшения</span>
        </Button>
      </div>

      {showAchievements && (
        <Card className="fixed top-20 right-4 z-20 w-80 bg-card/95 backdrop-blur-xl border-primary/30 p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Icon name="Trophy" size={24} />
                Достижения
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAchievements(false)}
                className="text-white/60 hover:text-white"
              >
                <Icon name="X" size={20} />
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-white/60">
                <span>Прогресс:</span>
                <span>{achievements.filter(a => a.unlocked).length} / {achievements.length}</span>
              </div>
              <Progress value={(achievements.filter(a => a.unlocked).length / achievements.length) * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              {achievements.map(achievement => (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-lg border transition-all ${
                    achievement.unlocked 
                      ? 'bg-primary/20 border-primary/40' 
                      : 'bg-muted/20 border-muted/20 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      achievement.unlocked
                        ? 'bg-gradient-to-br from-[#F97316] to-[#D946EF]'
                        : 'bg-muted/50'
                    }`}>
                      <Icon name={achievement.icon as any} size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">{achievement.title}</p>
                      <p className="text-xs text-white/60">{achievement.description}</p>
                      <div className="mt-1">
                        <div className="text-xs text-white/40">
                          {totalTaps} / {achievement.target} тапов
                        </div>
                        <Progress 
                          value={Math.min((totalTaps / achievement.target) * 100, 100)} 
                          className="h-1 mt-1" 
                        />
                      </div>
                    </div>
                    {achievement.unlocked && (
                      <Icon name="CheckCircle" size={20} className="text-green-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {showUpgrades && (
        <Card className="fixed top-20 right-4 z-20 w-80 bg-card/95 backdrop-blur-xl border-primary/30 p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Icon name="TrendingUp" size={24} />
                Улучшения
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUpgrades(false)}
                className="text-white/60 hover:text-white"
              >
                <Icon name="X" size={20} />
              </Button>
            </div>
            
            <div className="p-4 rounded-lg bg-muted/30 border border-primary/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F97316] to-[#D946EF] flex items-center justify-center">
                  <Icon name="Sparkles" size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">Уровень {upgradeLevel + 1}</p>
                  <p className="text-sm text-white/60">Доход за тап</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Текущий доход:</span>
                  <span className="text-white font-semibold">{coinsPerTap} монет</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Следующий доход:</span>
                  <span className="text-green-400 font-semibold">
                    {upgradeLevel === 0 ? 50 : coinsPerTap + 250} монет
                  </span>
                </div>
              </div>
              
              <Button
                onClick={handleUpgrade}
                disabled={coins < upgradeCost}
                className="w-full bg-gradient-to-r from-[#F97316] to-[#D946EF] hover:opacity-90 disabled:opacity-50"
              >
                <Icon name="ShoppingCart" size={16} className="mr-2" />
                Купить за {upgradeCost}
              </Button>
            </div>
            
            <div className="p-4 rounded-lg bg-muted/30 border border-accent/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#0EA5E9] flex items-center justify-center">
                  <Icon name="Timer" size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">Автодоход {autoIncomeLevel > 0 ? `ур. ${autoIncomeLevel}` : ''}</p>
                  <p className="text-sm text-white/60">Монеты в секунду</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Сейчас в секунду:</span>
                  <span className="text-white font-semibold">{coinsPerSecond} монет</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Следующий доход:</span>
                  <span className="text-green-400 font-semibold">
                    {autoIncomeLevel === 0 ? 5 : coinsPerSecond + 10} монет/сек
                  </span>
                </div>
              </div>
              
              <Button
                onClick={handleAutoIncomeUpgrade}
                disabled={coins < autoIncomeCost}
                className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#0EA5E9] hover:opacity-90 disabled:opacity-50"
              >
                <Icon name="Clock" size={16} className="mr-2" />
                Купить за {autoIncomeCost}
              </Button>
            </div>
            
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-xs text-white/60 text-center">
                💡 Улучшай тап и автодоход для максимального заработка!
              </p>
            </div>
          </div>
        </Card>
      )}
      
      <div className="relative z-10 w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#8B5CF6] via-[#D946EF] to-[#F97316] bg-clip-text text-transparent">
            TubeCoins
          </h1>
          <p className="text-white/60 text-lg">Создавай видео и получай монеты!</p>
        </div>

        <Card className="bg-card/50 backdrop-blur-xl border-primary/20 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F97316] to-[#D946EF] flex items-center justify-center">
                <Icon name="Coins" size={24} className="text-white" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Баланс</p>
                <p className="text-3xl font-bold text-white">{Math.floor(coins)}</p>
                {coinsPerSecond > 0 && (
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <Icon name="TrendingUp" size={12} />
                    +{coinsPerSecond}/сек
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-white/60 text-xs">Всего тапов</p>
                <p className="text-lg font-bold text-white">{totalTaps}</p>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center mb-8">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {floatingCoins.map(coin => (
                <div
                  key={coin.id}
                  className="absolute text-2xl animate-float-up"
                  style={{
                    left: `calc(50% + ${coin.x}px)`,
                    top: `calc(50% + ${coin.y}px)`
                  }}
                >
                  +{coinsPerTap}
                </div>
              ))}
            </div>
            
            <button
              onClick={handleTap}
              className={`w-64 h-64 rounded-full bg-gradient-to-br from-[#8B5CF6] via-[#D946EF] to-[#F97316] 
                flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95
                ${clickAnimation ? 'animate-coin-pop' : ''} animate-pulse-glow cursor-pointer border-4 border-white/10`}
            >
              <Icon name="Play" size={80} className="text-white drop-shadow-2xl" />
            </button>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleCreateVideo}
              disabled={isCreatingVideo}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] hover:opacity-90 transition-all"
            >
              {isCreatingVideo ? (
                <div className="flex items-center gap-2">
                  <Icon name="Loader2" size={20} className="animate-spin" />
                  Создание видео...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Icon name="Video" size={20} />
                  Создать видео
                </div>
              )}
            </Button>

            {isCreatingVideo && (
              <div className="space-y-2">
                <Progress value={videoProgress} className="h-2" />
                <p className="text-center text-sm text-white/60">{videoProgress}%</p>
              </div>
            )}
          </div>
        </Card>

        {videos.length > 0 && (
          <Card className="bg-card/50 backdrop-blur-xl border-primary/20 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Icon name="FileVideo" size={24} />
              Готовые видео
            </h2>
            <div className="space-y-3">
              {videos.map(video => (
                <div
                  key={video.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-primary/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#D946EF] flex items-center justify-center">
                      <Icon name="Film" size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{video.title}</p>
                      <p className="text-sm text-white/60 flex items-center gap-1">
                        <Icon name="Coins" size={14} />
                        +{video.coins} монет
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handlePublishVideo(video)}
                    className="bg-gradient-to-r from-[#F97316] to-[#D946EF] hover:opacity-90"
                  >
                    <Icon name="Upload" size={16} className="mr-2" />
                    Опубликовать
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="text-center space-y-2">
          <p className="text-white/40 text-sm">
            Нажимай на кнопку, создавай видео и зарабатывай TubeCoins! 💰
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-white/30">
            <span>⚡ Тап: +{coinsPerTap}</span>
            {coinsPerSecond > 0 && <span>⏱️ Авто: +{coinsPerSecond}/сек</span>}
            <span>🏆 {achievements.filter(a => a.unlocked).length}/{achievements.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}