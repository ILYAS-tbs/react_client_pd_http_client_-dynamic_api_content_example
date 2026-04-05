import React, { useEffect, useRef, useState } from "react";
import {
  Send,
  Search,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  User,
  Clock,
  X,
} from "lucide-react";
import {
  chat_http_client,
} from "../../services/chat/chat_http_client";
import { Parent } from "../../models/ParenAndStudent";
import { getCSRFToken } from "../../lib/get_CSRFToken";
import {
  GetConversationIDResponse,
  GetConvesationMessagesPayload,
  MarkChatMessagedAsRead,
  PrivateConversationIDPayload,
} from "../../services/chat/chat_http_payload_types";
import { SyncLoader } from "react-spinners";
import { Message } from "../../models/chat_system/Message";
import { SERVER_BASE_URL, WEBSOCKET_BASEURL } from "../../services/http_api/server_constants";
import { FilePreview } from "./file_preview";
import { EmojiComponent } from "./emoji_component";
import { SchoolChat } from "../../models/chat_system/SchoolChat";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../utils/translations";

interface SchoolParentChatProps {
  parents_list: Parent[];
  school_id: number;
}

const SchoolParentChat: React.FC<SchoolParentChatProps> = ({
  parents_list,
  school_id,
}) => {

  //! Translation :: 
  const { language } = useLanguage()

  const [selectedChat, setSelectedChat] = useState<string | number>();
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [parentsChats, setParentsChats] = useState<SchoolChat[]>([]);
  const get_current_school_parents_chats = async () => {
    const res = await chat_http_client.get_current_school_parents_chats();

    if (res.ok) {
      const parent_chats: SchoolChat[] = res.data;
      setParentsChats(parent_chats);
    }
  };
  useEffect(() => {
    get_current_school_parents_chats();
  }, []);

  const [chats, setChats] = useState<any[]>([]);
  useEffect(() => {
    if (parentsChats && parentsChats.length > 0) {
      const mappedChats = parentsChats.map((parent_chat) => ({
        id: parent_chat.parent_id ?? "",
        name: parent_chat.name ?? "مستخدم مجهول",
        lastMessage: parent_chat?.lastMessage?.content ?? "",
        timestamp:
          new Date(parent_chat.timestamp!).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }) ?? "10:30",
        unread: parent_chat.unread ?? 0,
        online: parent_chat.online ?? false,
        avatar: parent_chat.avatar ?? "",
      }));
      setChats(mappedChats);
    }
  }, [parentsChats]);

  function mapAPIMessagesToFrontMessage(messages_list: Message[]) {
    return messages_list.map((message: Message) => ({
      id: message.message_id,
      sender: String(message.from_user?.id) === String(school_id) ? "school" : "parent",
      content: message.content ?? "",
      timestamp: message.timestamp ? new Date(message.timestamp) : null,
      date: "اليوم",
      type: message.type ?? "text",
      file: message.file ?? "",
    }));
  }

  const currentChat = chats?.find((chat) => chat.id === selectedChat);
  const filteredChats = chats.filter(
    (chat) => chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  //! Chat system :
  const [conv_id, setConvID] = useState("");
  //? messages from the backend
  const [conv_messages, setConvMessages] = useState<Message[]>([]);
  //? messages used by the frontend
  const messages = mapAPIMessagesToFrontMessage(conv_messages);

  const [isChatLoading, setIsChatLoading] = useState(true);

  const handleSelectingAChat = async (user_id: string | number) => {
    setIsChatLoading(true);

    //? user_id : is the parent's id who we want to chat with
    let latest_csrf = getCSRFToken()!;
    const get_convID_payload: PrivateConversationIDPayload = {
      type: "private",
      other_user_id: user_id,
    };

    const res = await chat_http_client.get_conversation_id(
      get_convID_payload,
      latest_csrf
    );
    if (!res.ok) {
      console.error("Failed to get the conversation ID");
      return;
    }
    const data: GetConversationIDResponse = res.data;
    const latest_conv_id = data.conversation_id;
    setConvID(latest_conv_id);

    //! Fetch the messages for that conversation
    FetchMessages(latest_conv_id);

    //! Mark All Messages as read in the backend:
    const read_msgs_payload: MarkChatMessagedAsRead = {
      conversation_id: latest_conv_id
    }
    latest_csrf = getCSRFToken()!
    const read_msgs_res = chat_http_client.mark_conv_messaged_as_read(read_msgs_payload, latest_csrf)
    //! Optimistic update in the frontend :
    // ✅ Optimistic update: reset unread count locally
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === user_id
          ? { ...chat, unread: 0 } // set unread to 0 immediately
          : chat
      )
    );

    setIsChatLoading(false);
  };

  async function FetchMessages(latest_conv_id?: string) {
    const latest_csrf = getCSRFToken()!;
    const get_messages_payload: GetConvesationMessagesPayload = {
      conversation_id: latest_conv_id || conv_id,
    };

    const get_messages_res = await chat_http_client.get_conversation_messages(
      get_messages_payload,
      latest_csrf
    );
    if (!get_messages_res.ok) {
      console.error("Failed to fetch the conversation messages");
    }
    const new_messages_list: Message[] = get_messages_res.data;
    setConvMessages(new_messages_list);
  }

  //! WebSocket protocole :
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let websocket: WebSocket | null = null;

    //? 0.creating a new websocket connection - only when the conv-id changes
    const CHAT_WEBSOCKET_URL = `${WEBSOCKET_BASEURL}/ws/conversation/${conv_id}/`;
    websocket = new WebSocket(CHAT_WEBSOCKET_URL);

    //? 1.When connection opens
    websocket.onopen = function (event) {
      console.log("Connected to WebSocket server");
    };

    //? 2.When recieving a message :
    websocket.onmessage = function (event) {
      const new_msg: Message = JSON.parse(event.data);
      console.log(`Message received:`);
      console.log(new_msg);

      setConvMessages((prev) => [...prev, new_msg]);
    };

    //? 3.Handle errors
    websocket.onerror = function (error) {
      console.error("WebSocket error:", error);
    };

    //? 4.When connection closes
    websocket.onclose = function (event) {
      console.log("WebSocket closed:", event);
    };

    //? Accessing the socket outside :
    socketRef.current = websocket;

    // cleanup: close socket when component unmounts
    return () => {
      websocket.close();
    };
  }, [conv_id]);

  function sendTextTypeMessage(message: string) {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current?.send(
        JSON.stringify({
          message_type: "chat_message",
          message: message,
        })
      );
    } else {
      console.log("Socket not ready yet.");
    }
  }
  function sendFileTypeMessage(message_id: string) {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current?.send(
        JSON.stringify({
          message_type: "chat_file_message",
          message_id: message_id, // message_id in case of file
        })
      );
    } else {
      console.log("Socket not ready yet.");
    }
  }

  //! FILE SENDING SUPPORT
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleSendMessage = async () => {
    if (message.trim()) {
      // Handle sending message
      console.log("Sending message:", message);
      setMessage("");

      //? Message to the backend Comsumer :
      sendTextTypeMessage(message);
    }

    if (uploadedFile) {
      // handle sendind file-type message
      console.log("Sending File message:");

      const formData = new FormData();
      formData.append("conversation_id", conv_id);
      formData.append("file", uploadedFile);
      const latest_csrf = getCSRFToken()!;

      const upload_res = await chat_http_client.upload_chat_file(
        formData,
        latest_csrf
      );

      if (upload_res.ok) {
        console.log("upload_res OK");
        const message = upload_res.data;

        //? Notify the channel-layer
        sendFileTypeMessage(message.message_id);
      }

      setUploadedFile(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  //! CHAT UI IMPROVEMENTS :
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Scroll to the bottom whenever messages change
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 h-[600px] flex">
      {/* Sidebar - Chat List */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            {getTranslation('parents', language)}
          </h3>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder={getTranslation('search', language)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-9 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                setSelectedChat(chat.id);
                handleSelectingAChat(chat.id);
              }}
              className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedChat === chat.id
                ? "bg-primary-50 dark:bg-primary-900 border-r-2 border-primary-500"
                : ""
                }`}
            >
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  {chat.online && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {chat.name}
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {chat?.timestamp ?? ""}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {chat?.lastMessage ?? ""}
                    </p>
                    {chat.unread > 0 && (
                      <span className="bg-primary-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
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
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentChat.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {currentChat?.online ? "متصل الآن" : "آخر ظهور منذ ساعة"}
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
            {isChatLoading ? (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 flex justify-center items-center">
                <SyncLoader color="#3fa7a3" />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "school"
                      ? "justify-start"
                      : "justify-end"
                      }`}
                  >
                    {msg.type === "text" ? (
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.sender === "school"
                          ? "bg-primary-500 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                          }`}
                      >
                        <p className="text-sm">{msg?.content ?? ""}</p>
                        <div className="flex items-center justify-end mt-1 space-x-1 rtl:space-x-reverse">
                          <Clock className="h-3 w-3 opacity-70" />
                          <span className="text-xs opacity-70">
                            {msg.timestamp && (
                              <span className="text-xs opacity-70">
                                {msg.timestamp.toLocaleString("en", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <FilePreview url={SERVER_BASE_URL + msg.file} />
                    )}
                    {/* Scrolling till the end  */}
                    <div ref={endOfMessagesRef} />
                  </div>
                ))}
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                {/* FILE UPLOAD */}
                <label
                  htmlFor="message_file_school"
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <Paperclip className="h-5 w-5" />
                </label>
                <input
                  type="file"
                  name="message_file_school"
                  onChange={(e) =>
                    setUploadedFile(e.target?.files?.[0] ?? null)
                  }
                  id="message_file_school"
                  className="hidden"
                />

                {/* A message or File in case a file is uploaded */}
                <div className="flex-1 relative">
                  {!uploadedFile ? (
                    <>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="اكتب رسالتك..."
                        rows={1}
                        className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      />
                      <EmojiComponent setMessage={setMessage} />
                    </>
                  ) : (
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="absolute   left-1 top-1/2 transform -translate-y-1/2 p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-700 rounded"
                    >
                      <X />
                    </button>
                  )}
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() && !uploadedFile}
                  className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                {getTranslation('selectChatToStart', language)}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                اختر ولي أمر من القائمة لبدء المحادثة
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolParentChat;
