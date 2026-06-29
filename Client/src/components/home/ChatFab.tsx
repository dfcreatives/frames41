import Icon from '../ui/Icon'

interface ChatFabProps {
  onClick?: () => void
}

export default function ChatFab({ onClick }: ChatFabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open chat support"
      className="fixed bottom-10 right-10 z-40 bg-on-background text-white w-16 h-16 rounded-full flex items-center justify-center high-contrast-shadow hover:scale-110 active:scale-95 transition-all"
    >
      <Icon name="chat" />
    </button>
  )
}
