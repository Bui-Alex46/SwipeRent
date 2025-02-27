import { Sliders } from "lucide-react"

export function FilterButton() {
  return (
    <button className="p-2 bg-white rounded-full shadow-md text-midnight-blue transition-all hover:scale-105 hover:shadow-lg">
      <Sliders size={24} />
    </button>
  )
}

