import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PixelButton } from './PixelButton';
import { User, Lock, UserPlus, LogIn, AlertCircle } from 'lucide-react';

interface AuthProps {
    onLogin: (userData: any, username: string) => void;
}

export function Auth({ onLogin }: AuthProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (username.length < 3 || password.length < 3) {
            setError('Минимум 3 символа');
            return;
        }

        const usersJson = localStorage.getItem('arcade_users');
        const users = usersJson ? JSON.parse(usersJson) : {};

        if (isLogin) {
            const user = users[username];
            if (user && user.password === password) {
                onLogin(user.data, username);
            } else {
                setError('Неверное имя или пароль');
            }
        } else {
            if (users[username]) {
                setError('Пользователь уже существует');
                return;
            }

            const initialUserData = {
                avatar: '🎮',
                nickname: nickname || username,
                level: 1,
                rank: 'НОВИЧОК',
                xp: 0,
                nextLevelXp: 1000,
                totalScore: 0,
                gamesPlayed: 0,
                totalWins: 0,
                playTime: '0ч 0м',
            };

            const newUsers = {
                ...users,
                [username]: {
                    password,
                    data: initialUserData,
                }
            };

            localStorage.setItem('arcade_users', JSON.stringify(newUsers));
            onLogin(initialUserData, username);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-black/80 backdrop-blur-xl border-4 border-[#00ff00] rounded-2xl shadow-[0_0_50px_rgba(0,255,0,0.3)] max-w-md w-full mx-4 relative overflow-hidden">
            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-0" />

            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="z-10 w-full"
            >
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-black text-[#00ff00] tracking-tighter mb-2 italic">
                        {isLogin ? 'ВХОД В СИСТЕМУ' : 'РЕГИСТРАЦИЯ'}
                    </h2>
                    <p className="text-[#00ff00]/60 font-mono text-sm tracking-widest uppercase">
                        {isLogin ? 'Введите ваши учетные данные' : 'Создайте новый аккаунт'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User size={18} className="text-[#00ff00]/40 group-focus-within:text-[#00ff00]" />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="ЛОГИН"
                                className="w-full bg-black border-2 border-[#00ff00]/20 text-[#00ff00] pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-[#00ff00] transition-colors font-mono placeholder:text-[#00ff00]/20"
                                required
                            />
                        </div>

                        {!isLogin && (
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User size={18} className="text-[#00ff00]/40 group-focus-within:text-[#00ff00]" />
                                </div>
                                <input
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    placeholder="НИКНЕЙМ"
                                    className="w-full bg-black border-2 border-[#00ff00]/20 text-[#00ff00] pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-[#00ff00] transition-colors font-mono placeholder:text-[#00ff00]/20"
                                />
                            </div>
                        )}

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock size={18} className="text-[#00ff00]/40 group-focus-within:text-[#00ff00]" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="ПАРОЛЬ"
                                className="w-full bg-black border-2 border-[#00ff00]/20 text-[#00ff00] pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-[#00ff00] transition-colors font-mono placeholder:text-[#00ff00]/20"
                                required
                            />
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center gap-2 text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-lg"
                            >
                                <AlertCircle size={16} />
                                <span className="text-xs font-mono uppercase">{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-4 pt-2">
                        <PixelButton
                            type="submit"
                            variant="primary"
                            className="w-full py-4 text-lg flex items-center justify-center gap-2"
                        >
                            {isLogin ? (
                                <><LogIn size={20} /> ВОЙТИ</>
                            ) : (
                                <><UserPlus size={20} /> СОЗДАТЬ</>
                            )}
                        </PixelButton>

                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                            className="w-full text-[#00ff00]/60 hover:text-[#00ff00] font-mono text-xs tracking-widest uppercase transition-colors"
                        >
                            {isLogin ? 'Еще нет аккаунта? Создать' : 'Уже есть аккаунт? Войти'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
