export interface ChatHeaderProps {
  chatTitle?: string;
  personaName?: string;
  onMenuClick: () => void;
}

export interface PersonaSelectorProps {
  personas: any[];
  currentPersonaId?: string;
  onSelect: (personaId: string) => void;
}

export interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isLoading?: boolean;
}

export interface ChatSidebarProps {
  activeChat: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
}
