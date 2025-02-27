import { X, Heart, ArrowLeft } from "lucide-react"

interface ActionButtonsProps {
  onAction: (direction: "left" | "right") => void
  onBack?: () => void
  className?: string
}

export function ActionButtons({ onAction, onBack, className = '' }: ActionButtonsProps) {
  return (
    <div className={`flex justify-center gap-4 p-4 bg-white/5 backdrop-blur-md ${className}`}>
      {onBack && (
        <button
          onClick={onBack}
          className="p-4 rounded-full bg-gray-500/20 hover:bg-gray-500/30 transition-colors border border-gray-500/50"
        >
          <ArrowLeft className="w-8 h-8 text-gray-300" />
        </button>
      )}
      <button
        onClick={() => onAction("left")}
        className="p-4 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors border border-red-500/50"
      >
        <X className="w-8 h-8 text-red-500" />
      </button>
      <button
        onClick={() => onAction("right")}
        className="p-4 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 transition-colors border border-cyan-500/50"
      >
        <Heart className="w-8 h-8 text-cyan-500" />
      </button>
    </div>
  )
}

