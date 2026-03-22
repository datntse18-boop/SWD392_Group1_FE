import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Bike } from 'lucide-react';
import { suggestBikes, getCategories } from '@/services/api';
import { Link } from 'react-router-dom';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      type: 'text',
      text: 'Chào bạn! Mình là AI Assistant của CycleTrust. Cùng mình tìm chiếc xe đạp phù hợp nhất nhé!'
    },
    {
      id: 2,
      sender: 'bot',
      type: 'form'
    }
  ]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && categories.length === 0) {
      getCategories().then(res => setCategories(res)).catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const weight = formData.get('weight');
    const height = formData.get('height');
    const bikeType = formData.get('bikeType');
    const maxBudget = formData.get('maxBudget');

    const summaryText = [];
    if (height) summaryText.push(`Cao ${height}cm`);
    if (weight) summaryText.push(`Nặng ${weight}kg`);
    if (bikeType) summaryText.push(`${bikeType}`);
    if (maxBudget) summaryText.push(`< ${parseInt(maxBudget).toLocaleString('vi-VN')}đ`);

    const userText = summaryText.length > 0 ? `Tìm xe: ${summaryText.join(', ')}` : 'Tìm tất cả các xe';

    setMessages(prev => [
      ...prev.filter(m => m.type !== 'form'),
      { id: Date.now(), sender: 'user', type: 'text', text: userText }
    ]);

    setIsLoading(true);

    try {
      const payload = {};
      if (weight) payload.weight = parseFloat(weight);
      if (height) payload.height = parseFloat(height);
      if (bikeType) payload.bikeType = bikeType;
      if (maxBudget) payload.maxBudget = parseFloat(maxBudget);

      const res = await suggestBikes(payload);
      
      setMessages(prev => [
        ...prev,
        { id: Date.now(), sender: 'bot', type: 'result', text: res.message, bikes: res.suggestedBikes }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { id: Date.now(), sender: 'bot', type: 'text', text: 'Đã có lỗi xảy ra khi kết nối hệ thống. Bạn thử lại nhé!' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
        {
          id: Date.now(),
          sender: 'bot',
          type: 'text',
          text: 'Vui lòng cung cấp lại thông tin tìm kiếm:'
        },
        { id: Date.now() + 1, sender: 'bot', type: 'form' }
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {isOpen && (
        <div className="mb-4 w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col transform transition-all animate-in slide-in-from-bottom h-[560px] max-h-[85vh] pointer-events-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center shadow-md z-10">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full relative">
                <Bot size={22} className="relative z-10" />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-indigo-600 rounded-full z-20"></span>
              </div>
              <div>
                <h3 className="font-semibold text-sm tracking-wide">Assistant CycleTrust</h3>
                <p className="text-[11px] text-blue-100 font-medium">Trực tuyến</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors text-white/90">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-4">
            <div className="text-center my-2">
              <span className="text-[10px] bg-gray-200 text-gray-500 px-3 py-1 rounded-full uppercase tracking-wider font-semibold">Hôm nay</span>
            </div>
            
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center mr-2 mt-auto mb-1">
                    <Bot size={16} className="text-indigo-600" />
                  </div>
                )}
                
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-sm' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                }`}>
                  {msg.type === 'text' && <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>}
                  
                  {msg.type === 'form' && (
                    <form onSubmit={handleSubmitForm} className="flex flex-col gap-3 mt-1">
                      <div>
                        <label className="text-xs text-slate-500 font-semibold mb-1 block uppercase">Loại xe</label>
                        <select name="bikeType" className="w-full text-sm p-2.5 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-slate-50 text-slate-700">
                          <option value="">-- Tất cả loại xe --</option>
                          {categories.map(c => (
                            <option key={c.categoryId} value={c.categoryName}>{c.categoryName}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="text-xs text-slate-500 font-semibold mb-1 block uppercase">Cao (cm)</label>
                          <input type="number" name="height" placeholder="170" className="w-full text-sm p-2.5 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-slate-50 placeholder:text-slate-300" />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-slate-500 font-semibold mb-1 block uppercase">Nặng (kg)</label>
                          <input type="number" name="weight" placeholder="65" className="w-full text-sm p-2.5 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-slate-50 placeholder:text-slate-300" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 font-semibold mb-1 block uppercase">Ngân sách (Tối đa)</label>
                        <input type="number" name="maxBudget" placeholder="VD: 5000000" className="w-full text-sm p-2.5 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-slate-50 placeholder:text-slate-300" />
                      </div>
                      <button type="submit" className="mt-4 w-full bg-indigo-600 text-white font-medium text-sm py-2.5 rounded-lg hover:bg-indigo-700 transition-all flex justify-center items-center gap-2 shadow-md hover:shadow-lg active:scale-95">
                        <Send size={16} /> Bắt đầu tìm kiếm
                      </button>
                    </form>
                  )}

                  {msg.type === 'result' && (
                    <div className="flex flex-col gap-3">
                      <p className="whitespace-pre-line leading-relaxed pb-3 border-b border-gray-100 font-medium">{msg.text}</p>
                      {msg.bikes && msg.bikes.length > 0 ? (
                        <div className="flex flex-col gap-2 mt-1 -mx-2">
                          {msg.bikes.map(bike => (
                            <Link to={`/bike/${bike.bikeId}`} key={bike.bikeId} className="flex items-center gap-3 p-2 bg-white rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 group">
                              <div className="w-[60px] h-[60px] bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 shadow-sm relative">
                                {bike.imageUrls && bike.imageUrls.length > 0 ? (
                                  <img src={bike.imageUrls[0]} alt={bike.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <Bike size={24} />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col gap-1">
                                <h4 className="font-semibold text-[13px] text-slate-800 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">{bike.title}</h4>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-orange-600">{bike.price.toLocaleString('vi-VN')}đ</span>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-slate-50 p-3 rounded-lg flex items-center justify-center text-slate-500 text-xs italic">
                          Không có kết quả phụ họa.
                        </div>
                      )}
                      <button onClick={handleReset} className="w-full mt-2 rounded bg-indigo-50 text-indigo-600 font-semibold py-2 text-xs hover:bg-indigo-100 transition-colors">
                        Thử điều kiện khác
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start animate-in fade-in">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center mr-2 mt-auto mb-1">
                  <Bot size={16} className="text-indigo-600" />
                </div>
                <div className="bg-white px-5 py-4 rounded-2xl rounded-bl-sm border border-slate-200 shadow-sm flex gap-1.5 items-center">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${
          isOpen ? 'bg-indigo-700 md:rotate-90 scale-90 opacity-0 md:opacity-100' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-110 hover:shadow-blue-500/30'
        } pointer-events-auto text-white p-[18px] rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-indigo-300/50 group relative`}
        aria-label="Toggle chatbot"
      >
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-full transition-opacity"></div>
        {isOpen ? <X size={28} className="-rotate-90" /> : (
            <>
                <MessageCircle size={30} className="relative z-10" />
                <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full z-20"></span>
            </>
        )}
      </button>
    </div>
  );
};

export default Chatbot;
