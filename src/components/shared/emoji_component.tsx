import { useEffect, useRef, useState } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useTheme } from "../../hooks/useTheme";
import { Smile } from "lucide-react";

interface EmojiComponentProps {
  setMessage: React.Dispatch<React.SetStateAction<string>>;
}

export function EmojiComponent({ setMessage }: EmojiComponentProps) {
  const { isDark } = useTheme();
  //   console.log("Emoji theme:", isDark ? "dark" : "light");

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  // 👇 close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    }
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  return (
    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
      {/* Toggle button */}
      <button
        onClick={() => setShowEmojiPicker((prev) => !prev)}
        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <Smile className="h-4 w-4" />
      </button>

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div ref={pickerRef} className="absolute bottom-12 left-0 z-50">
          <Picker
            key={isDark ? "dark" : "light"} // re-render on theme change
            data={data}
            theme={isDark ? "dark" : "light"}
            onEmojiSelect={(emoji: any) =>
              setMessage((prev) => prev + emoji.native)
            }
          />
        </div>
      )}
    </div>
  );
}
