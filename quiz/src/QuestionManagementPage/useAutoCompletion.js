import { useRef, useCallback } from 'react';

export const useAutoCompletion = (rawInputText, setRawInputText) => {
  const textareaRef = useRef(null);

  const handleRawInputTextChange = useCallback((e) => {
    const newText = e.target.value;
    const textarea = textareaRef.current;
    if (!textarea) {
      setRawInputText(newText);
      return;
    }

    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = newText.substring(0, cursorPosition);
    const linesBeforeCursor = textBeforeCursor.split('\n');
    const currentLineBeforeCursor = linesBeforeCursor[linesBeforeCursor.length - 1];

    setRawInputText(newText); // Update rawInputText first

    // Auto-completion logic
    const lastCharTyped = newText.charAt(cursorPosition - 1);
    if (lastCharTyped === '.') {
      const currentLineText = currentLineBeforeCursor;
      const optionMatch = currentLineText.match(/^(\*\*?[A-Z])\.$/); // Detect "A." or "*A."

      if (optionMatch) {
        const optionLetter = optionMatch[1].replace('*', '');
        const letterCode = optionLetter.charCodeAt(0);

        if (letterCode >= 65 && letterCode <= 67) { // A, B, C (to suggest up to D)
          let autoSuggestions = '';
          const currentLineNumber = linesBeforeCursor.length - 1;

          for (let i = letterCode + 1; i <= 68; i++) { // Go up to 'D' (char code 68)
            const nextLetter = String.fromCharCode(i);
            const lineToCheck = newText.split('\n')[currentLineNumber + (i - letterCode)];
            
            // Only add suggestion if the next line does not already start with this option
            if (!lineToCheck || !lineToCheck.trim().startsWith(`${nextLetter}.`)) {
              autoSuggestions += `\n${nextLetter}. `;
            } else {
                // If D is already there, don't add
                break;
            }
          }

          if (autoSuggestions) {
            const updatedText = newText.substring(0, cursorPosition) + autoSuggestions + newText.substring(cursorPosition);
            setRawInputText(updatedText);

            // Calculate new cursor position
            const newCursorPosition = cursorPosition + autoSuggestions.length;
            
            // This is crucial: we must defer setting selection to allow React to update the DOM
            setTimeout(() => {
                if (textarea) {
                    textarea.selectionStart = newCursorPosition;
                    textarea.selectionEnd = newCursorPosition;
                }
            }, 0);
          }
        }
      }
    }
  }, [rawInputText, setRawInputText]); // Include setRawInputText in dependencies

  return { textareaRef, handleRawInputTextChange };
};
