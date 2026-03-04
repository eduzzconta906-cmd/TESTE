import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Bell, 
  Settings, 
  Share2, 
  RefreshCw, 
  ChevronRight,
  Clock,
  CheckCircle2,
  Sparkles,
  Heart,
  MessageSquare,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  getDailyVerse, 
  getDailyPrayers, 
  getDailyMessage,
  type BibleVerse, 
  type DailyPrayer, 
  type DailyMessage 
} from './services/bibleService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Tab = 'verse' | 'prayers' | 'message';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('verse');
  const [verse, setVerse] = useState<BibleVerse | null>(null);
  const [prayers, setPrayers] = useState<DailyPrayer | null>(null);
  const [message, setMessage] = useState<DailyMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [notificationTime, setNotificationTime] = useState('08:00');
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [nightNotificationTime, setNightNotificationTime] = useState('21:00');
  const [isNightNotificationEnabled, setIsNightNotificationEnabled] = useState(false);
  const [prayerTime, setPrayerTime] = useState<'morning' | 'night'>('morning');

  const fetchData = useCallback(async (force = false) => {
    setLoading(true);
    const today = new Date().toDateString();
    
    const savedVerse = localStorage.getItem('daily_verse');
    const savedPrayers = localStorage.getItem('daily_prayers');
    const savedMessage = localStorage.getItem('daily_message');
    const savedDate = localStorage.getItem('data_date');

    if (!force && savedDate === today && savedVerse && savedPrayers && savedMessage) {
      setVerse(JSON.parse(savedVerse));
      setPrayers(JSON.parse(savedPrayers));
      setMessage(JSON.parse(savedMessage));
      setLoading(false);
      return;
    }

    try {
      const [newVerse, newPrayers, newMessage] = await Promise.all([
        getDailyVerse(),
        getDailyPrayers(),
        getDailyMessage()
      ]);
      
      setVerse(newVerse);
      setPrayers(newPrayers);
      setMessage(newMessage);
      
      localStorage.setItem('daily_verse', JSON.stringify(newVerse));
      localStorage.setItem('daily_prayers', JSON.stringify(newPrayers));
      localStorage.setItem('daily_message', JSON.stringify(newMessage));
      localStorage.setItem('data_date', today);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const savedTime = localStorage.getItem('notification_time');
    const savedEnabled = localStorage.getItem('notification_enabled');
    const savedNightTime = localStorage.getItem('night_notification_time');
    const savedNightEnabled = localStorage.getItem('night_notification_enabled');
    
    if (savedTime) setNotificationTime(savedTime);
    if (savedEnabled === 'true') setIsNotificationEnabled(true);
    if (savedNightTime) setNightNotificationTime(savedNightTime);
    if (savedNightEnabled === 'true') setIsNightNotificationEnabled(true);

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const toggleNotifications = () => {
    setIsNotificationEnabled(!isNotificationEnabled);
    localStorage.setItem('notification_enabled', (!isNotificationEnabled).toString());
  };

  const toggleNightNotifications = () => {
    setIsNightNotificationEnabled(!isNightNotificationEnabled);
    localStorage.setItem('night_notification_enabled', (!isNightNotificationEnabled).toString());
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    setNotificationTime(time);
    localStorage.setItem('notification_time', time);
  };

  const handleNightTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    setNightNotificationTime(time);
    localStorage.setItem('night_notification_time', time);
  };

  const navigateTo = (tab: Tab) => {
    setActiveTab(tab);
    setShowMenu(false);
  };

  const renderVerse = () => (
    <motion.div
      key="verse-view"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative group"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-sacred-accent/10 to-sacred-blue/10 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
      <div className="relative glass rounded-[2rem] p-8 md:p-12 overflow-hidden shadow-xl shadow-black/5">
        <div className="absolute top-0 right-0 p-6 opacity-5">
          <Sparkles className="w-24 h-24 text-sacred-accent" />
        </div>
        
        <span className="inline-block px-3 py-1 rounded-full bg-sacred-accent/10 text-sacred-accent text-[10px] font-tech uppercase tracking-widest mb-6">
          Versículo do Dia
        </span>
        
        <blockquote className="text-2xl md:text-4xl font-display italic leading-relaxed mb-8 animate-glow text-sacred-blue">
          "{verse?.text}"
        </blockquote>
        
        <div className="flex items-center justify-between">
          <cite className="not-italic font-tech text-sacred-accent tracking-wide text-sm md:text-base font-medium">
            — {verse?.reference}
          </cite>
          <div className="flex gap-2">
            <button className="p-2 glass rounded-lg hover:bg-white/90 transition-colors">
              <Share2 className="w-4 h-4 text-black/30" />
            </button>
          </div>
        </div>

        {verse?.context && (
          <div className="mt-10 pt-8 border-t border-black/5">
            <p className="text-sm text-black/40 leading-relaxed font-sans italic">
              {verse.context}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderPrayers = () => (
    <motion.div
      key="prayers-view"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-6"
    >
      <div className="flex glass p-1 rounded-2xl mb-6">
        <button 
          onClick={() => setPrayerTime('morning')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-tech text-xs uppercase tracking-widest transition-all",
            prayerTime === 'morning' ? "bg-sacred-accent text-white shadow-lg shadow-sacred-accent/20" : "text-black/40 hover:text-black/60"
          )}
        >
          <Sun className="w-4 h-4" />
          Manhã
        </button>
        <button 
          onClick={() => setPrayerTime('night')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-tech text-xs uppercase tracking-widest transition-all",
            prayerTime === 'night' ? "bg-sacred-blue text-white shadow-lg shadow-sacred-blue/20" : "text-black/40 hover:text-black/60"
          )}
        >
          <Moon className="w-4 h-4" />
          Noite
        </button>
      </div>

      <div className="glass rounded-[2rem] p-8 md:p-12 shadow-xl shadow-black/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5">
          {prayerTime === 'morning' ? <Sun className="w-24 h-24 text-sacred-accent" /> : <Moon className="w-24 h-24 text-sacred-blue" />}
        </div>
        
        <span className={cn(
          "inline-block px-3 py-1 rounded-full text-[10px] font-tech uppercase tracking-widest mb-6",
          prayerTime === 'morning' ? "bg-sacred-accent/10 text-sacred-accent" : "bg-sacred-blue/10 text-sacred-blue"
        )}>
          {prayerTime === 'morning' ? 'Oração do Dia' : 'Oração da Noite'}
        </span>

        <p className="text-xl md:text-2xl font-display italic leading-relaxed text-black/80">
          {prayerTime === 'morning' ? prayers?.morning : prayers?.night}
        </p>
        
        <div className="mt-12 flex justify-end">
          <button className="p-3 glass rounded-xl hover:bg-white/90 transition-colors">
            <Share2 className="w-5 h-5 text-black/30" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderMessage = () => (
    <motion.div
      key="message-view"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass rounded-[2rem] p-8 md:p-12 shadow-xl shadow-black/5 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-6 opacity-5">
        <MessageSquare className="w-24 h-24 text-sacred-blue" />
      </div>

      <span className="inline-block px-3 py-1 rounded-full bg-sacred-blue/10 text-sacred-blue text-[10px] font-tech uppercase tracking-widest mb-6">
        Mensagem do Dia
      </span>

      <h2 className="text-2xl md:text-3xl font-tech font-medium text-sacred-blue mb-6">
        {message?.title}
      </h2>

      <p className="text-lg md:text-xl font-sans leading-relaxed text-black/70 mb-8">
        {message?.content}
      </p>

      {message?.reference && (
        <div className="pt-8 border-t border-black/5 flex items-center justify-between">
          <cite className="not-italic font-tech text-sacred-accent tracking-wide text-sm">
            Ref: {message.reference}
          </cite>
          <button className="p-2 glass rounded-lg hover:bg-white/90 transition-colors">
            <Share2 className="w-4 h-4 text-black/30" />
          </button>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center p-4 md:p-8 overflow-x-hidden bg-[#F8F9FA]">
      {/* Splash Screen */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F8F9FA]"
          >
            <div className="fixed inset-0 pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sacred-accent/5 rounded-full blur-[120px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sacred-blue/10 rounded-full blur-[120px]" />
            </div>
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-center z-10"
            >
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="text-7xl mb-8"
              >
                🙏
              </motion.div>
              <h1 className="text-5xl md:text-6xl font-tech font-bold text-sacred-blue tracking-tighter mb-4 animate-glow">
                BÍBLIA SAGRADA
              </h1>
              <div className="w-12 h-[2px] bg-sacred-accent/20 mx-auto mb-6" />
              <p className="text-xl md:text-2xl font-display italic text-sacred-accent tracking-wide">
                Seu momento mais perto do pai
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sacred-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sacred-blue/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-2xl z-10 flex flex-col min-h-[calc(100vh-4rem)]">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 md:mb-12">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowMenu(true)}
              className="w-10 h-10 glass rounded-xl flex items-center justify-center hover:bg-white/90 transition-colors"
            >
              <Menu className="w-5 h-5 text-sacred-accent" />
            </button>
            <div>
              <h1 className="text-lg font-tech font-medium tracking-tight text-sacred-blue">BÍBLIA SAGRADA</h1>
              <p className="text-[10px] text-black/40 uppercase tracking-[0.1em]">
                {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => fetchData(true)}
              className="w-10 h-10 glass rounded-xl flex items-center justify-center hover:bg-white/90 transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-black/40" />
            </button>
            <button 
              onClick={() => setShowSettings(true)}
              className="w-10 h-10 glass rounded-xl flex items-center justify-center hover:bg-white/90 transition-colors"
            >
              <Settings className="w-5 h-5 text-black/40" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col justify-center pb-24">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 py-20"
              >
                <div className="relative w-16 h-16">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-full h-full border-2 border-sacred-accent/20 border-t-sacred-accent rounded-full"
                  />
                  <BookOpen className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-sacred-accent" />
                </div>
                <p className="text-sm font-tech tracking-[0.2em] uppercase text-black/30">Sincronizando...</p>
              </motion.div>
            ) : (
              <div className="py-4">
                {activeTab === 'verse' && renderVerse()}
                {activeTab === 'prayers' && renderPrayers()}
                {activeTab === 'message' && renderMessage()}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Menu (Fixed Bottom Nav) */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-50">
          <nav className="glass rounded-2xl p-2 flex items-center justify-around shadow-2xl shadow-black/10 border-white/60">
            <button 
              onClick={() => setActiveTab('verse')}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all flex-1",
                activeTab === 'verse' ? "bg-sacred-accent/10 text-sacred-accent" : "text-black/30 hover:text-black/50"
              )}
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-[9px] font-tech uppercase tracking-widest">Versículo</span>
            </button>
            <button 
              onClick={() => setActiveTab('prayers')}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all flex-1",
                activeTab === 'prayers' ? "bg-sacred-accent/10 text-sacred-accent" : "text-black/30 hover:text-black/50"
              )}
            >
              <Heart className="w-5 h-5" />
              <span className="text-[9px] font-tech uppercase tracking-widest">Orações</span>
            </button>
            <button 
              onClick={() => setActiveTab('message')}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all flex-1",
                activeTab === 'message' ? "bg-sacred-accent/10 text-sacred-accent" : "text-black/30 hover:text-black/50"
              )}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-[9px] font-tech uppercase tracking-widest">Mensagem</span>
            </button>
          </nav>
        </div>

        {/* Footer */}
        <footer className="py-4 text-center text-[9px] font-tech uppercase tracking-[0.3em] text-black/20">
          Sacred Digital Experience © 2026
        </footer>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass w-full max-w-sm rounded-3xl p-8 overflow-hidden relative shadow-2xl shadow-black/10"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-tech font-medium text-sacred-blue">Configurações</h2>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-black/40" />
                </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className={clsx("w-5 h-5", isNotificationEnabled ? "text-sacred-accent" : "text-black/10")} />
                      <span className="text-sm font-medium text-black/70">Notificações Diárias</span>
                    </div>
                    <button
                      onClick={toggleNotifications}
                      className={clsx(
                        "w-12 h-6 rounded-full transition-colors relative",
                        isNotificationEnabled ? "bg-sacred-accent" : "bg-black/10"
                      )}
                    >
                      <motion.div
                        animate={{ x: isNotificationEnabled ? 24 : 4 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                      />
                    </button>
                  </div>
                  
                  {isNotificationEnabled && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="pt-4 border-t border-black/5"
                    >
                      <label className="block text-[10px] font-tech uppercase tracking-widest text-black/30 mb-2">
                        Horário do Versículo
                      </label>
                      <input
                        type="time"
                        value={notificationTime}
                        onChange={handleTimeChange}
                        className="w-full bg-black/5 border border-black/10 rounded-xl p-3 text-black font-tech focus:outline-none focus:border-sacred-accent/50 transition-colors"
                      />
                    </motion.div>
                  )}

                  <div className="pt-6 border-t border-black/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Moon className={clsx("w-5 h-5", isNightNotificationEnabled ? "text-sacred-accent" : "text-black/10")} />
                        <span className="text-sm font-medium text-black/70">Oração da Noite</span>
                      </div>
                      <button
                        onClick={toggleNightNotifications}
                        className={clsx(
                          "w-12 h-6 rounded-full transition-colors relative",
                          isNightNotificationEnabled ? "bg-sacred-accent" : "bg-black/10"
                        )}
                      >
                        <motion.div
                          animate={{ x: isNightNotificationEnabled ? 24 : 4 }}
                          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                        />
                      </button>
                    </div>
                    
                    {isNightNotificationEnabled && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="pt-4"
                      >
                        <label className="block text-[10px] font-tech uppercase tracking-widest text-black/30 mb-2">
                          Horário da Oração
                        </label>
                        <input
                          type="time"
                          value={nightNotificationTime}
                          onChange={handleNightTimeChange}
                          className="w-full bg-black/5 border border-black/10 rounded-xl p-3 text-black font-tech focus:outline-none focus:border-sacred-accent/50 transition-colors"
                        />
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-black/5">
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="w-full py-4 bg-sacred-accent text-white font-tech font-bold rounded-2xl hover:bg-sacred-accent/90 transition-colors shadow-lg shadow-sacred-accent/20"
                  >
                    CONCLUÍDO
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side Menu Drawer */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex justify-start bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMenu(false)}
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="w-full max-w-[280px] h-full bg-white shadow-2xl p-8 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-sacred-accent" />
                  <span className="font-tech font-bold text-sacred-blue tracking-tight">MENU</span>
                </div>
                <button 
                  onClick={() => setShowMenu(false)}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-black/40" />
                </button>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => navigateTo('verse')}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl transition-all",
                    activeTab === 'verse' ? "bg-sacred-accent/10 text-sacred-accent" : "text-black/60 hover:bg-black/5"
                  )}
                >
                  <BookOpen className="w-5 h-5" />
                  <span className="font-tech text-sm uppercase tracking-widest font-medium">Versículo do Dia</span>
                </button>
                <button 
                  onClick={() => navigateTo('prayers')}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl transition-all",
                    activeTab === 'prayers' ? "bg-sacred-accent/10 text-sacred-accent" : "text-black/60 hover:bg-black/5"
                  )}
                >
                  <Heart className="w-5 h-5" />
                  <span className="font-tech text-sm uppercase tracking-widest font-medium">Orações do Dia</span>
                </button>
                <button 
                  onClick={() => navigateTo('message')}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl transition-all",
                    activeTab === 'message' ? "bg-sacred-accent/10 text-sacred-accent" : "text-black/60 hover:bg-black/5"
                  )}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-tech text-sm uppercase tracking-widest font-medium">Mensagem do Dia</span>
                </button>
              </div>

              <div className="mt-auto pt-8 border-t border-black/5">
                <button 
                  onClick={() => { setShowSettings(true); setShowMenu(false); }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-black/40 hover:bg-black/5 transition-all"
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-tech text-sm uppercase tracking-widest font-medium">Configurações</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
