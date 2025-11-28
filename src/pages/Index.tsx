import { useState } from 'react';
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

export default function Index() {
  const [coins, setCoins] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isCreatingVideo, setIsCreatingVideo] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [clickAnimation, setClickAnimation] = useState(false);
  const [floatingCoins, setFloatingCoins] = useState<Array<{id: number, x: number, y: number}>>([]);

  const handleTap = () => {
    setCoins(prev => prev + 1);
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
                <p className="text-3xl font-bold text-white">{coins}</p>
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
                  +1
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

        <div className="text-center">
          <p className="text-white/40 text-sm">
            Нажимай на кнопку, создавай видео и зарабатывай TubeCoins! 💰
          </p>
        </div>
      </div>
    </div>
  );
}
