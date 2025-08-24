import React, { useState } from 'react';
import { Send, Search, Phone, Video, MoreVertical, Paperclip, Smile, User, Clock } from 'lucide-react';

interface ParentChatProps {
  userType: 'parent' | 'teacher';
}

const ParentChat: React.FC<ParentChatProps> = ({ userType }) => {
  const [selectedChat, setSelectedChat] = useState('chat1');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const chats = [
    {
      id: 'chat1',
      name: userType === 'parent' ? 'الأستاذة فاطمة حسن' : 'أم أحمد (فاطمة)',
      subject: userType === 'parent' ? 'معلمة اللغة العربية' : 'ولي أمر أحمد محمد',
      lastMessage: 'شكراً لك على المتابعة المستمرة',
      timestamp: '10:30',
      unread: 2,
      online: true,
      avatar: null,
      studentName: userType === 'teacher' ? 'أحمد محمد' : null
    },
    {
      id: 'chat2',
      name: userType === 'parent' ? 'الأستاذ أحمد بن علي' : 'أبو فاطمة (محمد)',
      subject: userType === 'parent' ? 'معلم الرياضيات' : 'ولي أمر فاطمة أحمد',
      lastMessage: 'موعد الامتحان يوم الاثنين القادم',
      timestamp: 'أمس',
      unread: 0,
      online: false,
      avatar: null,
      studentName: userType === 'teacher' ? 'فاطمة أحمد' : null
    },
    {
      id: 'chat3',
      name: userType === 'parent' ? 'الأستاذة زينب العلي' : 'أم سارة (زينب)',
      subject: userType === 'parent' ? 'معلمة التاريخ' : 'ولي أمر سارة محمد',
      lastMessage: 'أرجو تذكير سارة بأداء الواجب',
      timestamp: 'أمس',
      unread: 1,
      online: true,
      avatar: null,
      studentName: userType === 'teacher' ? 'سارة محمد' : null
    }
  ];

  const messages = [
    {
      id: 1,
      sender: userType === 'parent' ? 'teacher' : 'parent',
      content: 'السلام عليكم ورحمة الله وبركاته',
      timestamp: '09:00',
      date: 'اليوم',
      type: 'text'
    },
    {
      id: 2,
      sender: userType === 'parent' ? 'parent' : 'teacher',
      content: 'وعليكم السلام ورحمة الله وبركاته، أهلاً وسهلاً',
      timestamp: '09:02',
      date: 'اليوم',
      type: 'text'
    },
    {
      id: 3,
      sender: userType === 'parent' ? 'teacher' : 'parent',
      content: userType === 'parent' 
        ? 'أود أن أناقش معك أداء أحمد في مادة اللغة العربية. لاحظت تحسناً ملحوظاً في درجاته الأخيرة'
        : 'أريد أن أستفسر عن أداء ابني أحمد في الصف. هل هناك أي ملاحظات خاصة؟',
      timestamp: '09:05',
      date: 'اليوم',
      type: 'text'
    },
    {
      id: 4,
      sender: userType === 'parent' ? 'parent' : 'teacher',
      content: userType === 'parent' 
        ? 'الحمد لله، هذا يسعدني جداً. هل من نصائح إضافية لمساعدته على الاستمرار في هذا التقدم؟'
        : 'أحمد طالب مجتهد ومهذب. أداؤه ممتاز في الصف ويشارك بفعالية. أنصح بمواصلة تشجيعه على القراءة في البيت',
      timestamp: '09:10',
      date: 'اليوم',
      type: 'text'
    },
    {
      id: 5,
      sender: userType === 'parent' ? 'teacher' : 'parent',
      content: 'نعم، أنصح بقراءة 15 دقيقة يومياً من كتب القصص المناسبة لعمره، وحل تمارين الإملاء بانتظام',
      timestamp: '09:15',
      date: 'اليوم',
      type: 'text'
    },
    {
      id: 6,
      sender: userType === 'parent' ? 'parent' : 'teacher',
      content: 'شكراً لك على المتابعة المستمرة والاهتمام. سأطبق نصائحك بإذن الله',
      timestamp: '10:30',
      date: 'اليوم',
      type: 'text'
    }
  ];

  const currentChat = chats.find(chat => chat.id === selectedChat);
  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle sending message
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 h-[600px] flex">
      {/* Sidebar - Chat List */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            {userType === 'parent' ? 'المعلمون' : 'أولياء الأمور'}
          </h3>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="البحث..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-9 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                selectedChat === chat.id ? 'bg-green-50 dark:bg-green-900 border-r-2 border-green-500' : ''
              }`}
            >
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  {chat.online && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {chat.name}
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{chat.timestamp}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{chat.subject}</p>
                  {chat.studentName && (
                    <p className="text-xs text-green-600 dark:text-green-400 mb-1">الطالب: {chat.studentName}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{chat.lastMessage}</p>
                    {chat.unread > 0 && (
                      <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  {currentChat.online && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{currentChat.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{currentChat.subject}</p>
                  {currentChat.studentName && (
                    <p className="text-xs text-green-600 dark:text-green-400">الطالب: {currentChat.studentName}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {currentChat.online ? 'متصل الآن' : 'آخر ظهور منذ ساعة'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <Phone className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <Video className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === (userType === 'parent' ? 'parent' : 'teacher') ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.sender === (userType === 'parent' ? 'parent' : 'teacher')
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <div className="flex items-center justify-end mt-1 space-x-1 rtl:space-x-reverse">
                      <Clock className="h-3 w-3 opacity-70" />
                      <span className="text-xs opacity-70">{msg.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <Paperclip className="h-5 w-5" />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="اكتب رسالتك..."
                    rows={1}
                    className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />
                  <button className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <Smile className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                اختر محادثة للبدء
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                اختر {userType === 'parent' ? 'معلماً' : 'ولي أمر'} من القائمة لبدء المحادثة
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentChat;