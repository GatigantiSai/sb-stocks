import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ArrowRight, ShieldCheck, DollarSign, BarChart3, LineChart, Globe } from 'lucide-react';

const Landing = () => {
  const [tickerPrices, setTickerPrices] = useState([
    { symbol: 'AAPL', price: 175.50, change: 1.25, name: 'Apple' },
    { symbol: 'MSFT', price: 420.20, change: -0.45, name: 'Microsoft' },
    { symbol: 'NVDA', price: 875.10, change: 4.82, name: 'Nvidia' },
    { symbol: 'TSLA', price: 171.20, change: -2.15, name: 'Tesla' },
    { symbol: 'AMZN', price: 178.40, change: 0.85, name: 'Amazon' }
  ]);

  // Simulate live ticking on the landing page
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerPrices(prev =>
        prev.map(t => {
          const changePct = (Math.random() * 2 - 1) / 100;
          const newPrice = parseFloat((t.price * (1 + changePct)).toFixed(2));
          const netChange = parseFloat((t.change + changePct * 10).toFixed(2));
          return { ...t, price: newPrice, change: netChange };
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-darkBg overflow-hidden relative text-white flex flex-col justify-between">
      
      {/* Background Decorative Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 h-20 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2 text-xl font-extrabold tracking-wider">
          <span className="p-1.5 bg-accentBlue rounded-lg text-white shadow-lg">
            <TrendingUp size={24} />
          </span>
          <span>SB <span className="text-accentBlue">STOCKS</span></span>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-gray-300 hover:text-white transition-colors text-sm font-semibold">
            Sign In
          </Link>
          <Link to="/register" className="bg-accentBlue hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition-all">
            Get Started
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-6 py-12 flex flex-col lg:flex-row items-center justify-between gap-12 z-10 flex-1">
        
        {/* Left Hero Text */}
        <div className="flex-1 text-center lg:text-left space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">
            <span>✨ Zero-Risk Paper Trading Platform</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none">
            Master the Stock Market with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Virtual Capital</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto lg:mx-0">
            Practice stock trading with $100,000 USD virtual currency. Real-time market prices, portfolio analytics, and professional tools—completely free.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link to="/register" className="w-full sm:w-auto bg-accentBlue hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center space-x-2">
              <span>Start Trading Now</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="w-full sm:w-auto bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 px-8 py-3.5 rounded-xl font-bold transition-all text-center">
              Login to Portfolio
            </Link>
          </div>
        </div>

        {/* Right Preview Card / Real-time tickers */}
        <div className="flex-1 w-full max-w-md lg:max-w-none">
          <div className="glass p-6 rounded-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-white">Live Market Tickers</h3>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>

            {/* List of stocks ticking */}
            <div className="space-y-4">
              {tickerPrices.map(stock => (
                <div key={stock.symbol} className="flex justify-between items-center p-3.5 rounded-xl bg-gray-900/60 border border-darkBorder hover:border-gray-700 transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-800 rounded-lg font-bold text-sm tracking-wide">
                      {stock.symbol}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{stock.name}</div>
                      <div className="text-xs text-gray-500">NASDAQ</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm">${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    <div className={`text-xs font-semibold ${stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Simulated Balance Banner */}
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-900/40 to-emerald-950/20 border border-blue-500/20 flex justify-between items-center">
              <div>
                <span className="text-xs text-gray-400 font-semibold block uppercase">Mock Virtual Balance</span>
                <span className="text-2xl font-extrabold text-white">$100,000.00</span>
              </div>
              <span className="p-3 bg-emerald-500/10 rounded-full text-emerald-400">
                <DollarSign size={24} />
              </span>
            </div>

          </div>
        </div>

      </main>

      {/* Feature Grid */}
      <section className="bg-gray-900/40 border-t border-darkBorder/60 py-12 z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="flex items-start space-x-4">
            <span className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
              <DollarSign size={24} />
            </span>
            <div>
              <h4 className="font-bold text-base mb-1">No Real Money At Risk</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Test trading strategies, experiment with high-risk positions, and learn how markets work without losing actual money.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <span className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <LineChart size={24} />
            </span>
            <div>
              <h4 className="font-bold text-base mb-1">Interactive Stock Charts</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Analyze past market performance and trends using 30-day historical prices and visual charts powered by Recharts.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <span className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <ShieldCheck size={24} />
            </span>
            <div>
              <h4 className="font-bold text-base mb-1">Complete Admin Portal</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Full-featured admin suite allows system moderation, user suspension, adding stocks, and examining trading volume.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-darkBorder py-6 text-center text-xs text-gray-500 z-10 bg-darkBg">
        <p>&copy; {new Date().getFullYear()} SB Stocks. Built with MongoDB, Express, React, and Node.js. Educational Purpose Only.</p>
      </footer>

    </div>
  );
};

export default Landing;
