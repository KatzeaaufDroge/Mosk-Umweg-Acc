import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

const MotionLink = motion.create(Link)

interface MobileDropdownItem {
  name: string
  to?: string
  icon: LucideIcon
  onClick: () => void
  image?: string
}

interface MobileDropdownProps {
  items: MobileDropdownItem[]
  activeSection?: string
}

export function MobileDropdown({ items, activeSection }: MobileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleItemClick = (onClick: () => void) => {
    onClick()
    setIsOpen(false)
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: 0 }}
              animate={{ rotate: 90 }}
              exit={{ rotate: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} className="text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: -90 }}
              animate={{ rotate: 0 }}
              exit={{ rotate: -90 }}
              transition={{ duration: 0.2 }}
            >
              <Menu size={24} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-48 bg-black/95 border border-white/10 backdrop-blur-lg rounded-lg shadow-lg overflow-hidden z-50"
          >
            {items.map((item, index) => {
              const Icon = item.icon
              const isActive = activeSection === item.name

              const itemClassName = `w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`

              const content = (
                <>
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-[18px] h-[18px]" />
                  ) : (
                    <Icon size={18} />
                  )}
                  <span className="text-sm font-medium">{item.name}</span>
                </>
              )

              if (item.to) {
                return (
                  <MotionLink
                    key={item.name}
                    to={item.to}
                    onClick={() => handleItemClick(item.onClick)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={itemClassName}
                  >
                    {content}
                  </MotionLink>
                )
              }

              return (
                <motion.button
                  key={item.name}
                  onClick={() => handleItemClick(item.onClick)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={itemClassName}
                >
                  {content}
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
