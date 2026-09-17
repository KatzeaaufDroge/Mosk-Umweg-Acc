import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  to?: string
  onClick?: () => void
  icon?: LucideIcon
  image?: string
  mobileImage?: string
}

interface NavBarProps {
  items: NavItem[]
  className?: string
  activeSection?: string
}

export function NavBar({ items, className, activeSection }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0].name)

  useEffect(() => {
    if (activeSection) {
      setActiveTab(activeSection)
    }
  }, [activeSection])

  return (
    <div className={cn(className)}>
      <div className="flex items-center gap-3 bg-black/80 border border-white/10 backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          const handleClick = () => {
            setActiveTab(item.name)
            item.onClick?.()
          }

          const navClassName = cn(
            "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-all",
            "text-white/60 hover:text-white",
            isActive && "text-white drop-shadow-[0_0_8px_rgba(255,255,255,1)] drop-shadow-[0_0_16px_rgba(100,200,255,0.8)]",
          )

          const content = (
            <>
              {item.mobileImage ? (
                <>
                  <span className="hidden md:inline">{item.name}</span>
                  <span className="md:hidden">
                    <img src={item.mobileImage} alt={item.name} className="h-5 w-5" />
                  </span>
                </>
              ) : item.image ? (
                <>
                  <span className="hidden md:inline">
                    <img src={item.image} alt={item.name} className="h-5 w-5 inline-block" />
                  </span>
                  <span className="md:hidden">
                    <img src={item.image} alt={item.name} className="h-5 w-5" />
                  </span>
                </>
              ) : Icon ? (
                <>
                  <span className="hidden md:inline">{item.name}</span>
                  <span className="md:hidden">
                    <Icon size={18} strokeWidth={2.5} />
                  </span>
                </>
              ) : (
                <span>{item.name}</span>
              )}
              {isActive && (
                <motion.div
                  className="absolute inset-0 w-full bg-white/5 rounded-full -z-10"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    duration: 0.3,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-t-full">
                    <div className="absolute w-12 h-6 bg-white/10 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-white/10 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-white/10 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </>
          )

          if (item.to) {
            return (
              <Link key={item.name} to={item.to} onClick={handleClick} className={navClassName}>
                {content}
              </Link>
            )
          }

          return (
            <button key={item.name} onClick={handleClick} className={navClassName}>
              {content}
            </button>
          )
        })}
      </div>
    </div>
  )
}
