import { useEffect, useRef, useState } from "react";

type ModalFormMode = "add" | "edit";

interface UseModalFormResetOptions<T> {
  isOpen: boolean;
  mode: ModalFormMode;
  resetForm: () => void;
  populateForm?: (item: T) => void;
  selectedItem?: T | null;
  selectedKey?: string | number | null;
}

export const useModalFormReset = <T,>({
  isOpen,
  mode,
  resetForm,
  populateForm,
  selectedItem = null,
  selectedKey = null,
}: UseModalFormResetOptions<T>) => {
  const [formKey, setFormKey] = useState(0);
  const wasOpenRef = useRef(isOpen);
  const previousSelectedKeyRef = useRef<string | number | null>(selectedKey);

  useEffect(() => {
    const opened = isOpen && !wasOpenRef.current;
    const closed = !isOpen && wasOpenRef.current;
    const selectedChanged =
      isOpen &&
      mode === "edit" &&
      previousSelectedKeyRef.current !== selectedKey &&
      selectedKey !== null;

    if (opened) {
      if (mode === "edit" && selectedItem && populateForm) {
        populateForm(selectedItem);
      } else {
        resetForm();
      }
      setFormKey((currentKey) => currentKey + 1);
    } else if (selectedChanged && selectedItem && populateForm) {
      populateForm(selectedItem);
      setFormKey((currentKey) => currentKey + 1);
    } else if (closed) {
      resetForm();
      setFormKey((currentKey) => currentKey + 1);
    }

    wasOpenRef.current = isOpen;
    previousSelectedKeyRef.current = selectedKey;
  }, [isOpen, mode, populateForm, resetForm, selectedItem, selectedKey]);

  return { formKey };
};