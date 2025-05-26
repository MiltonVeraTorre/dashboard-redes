import * as React from "react"

export interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  disabled?: boolean
  children?: React.ReactNode
}

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
}

export interface SelectContentProps {
  children?: React.ReactNode
}

export interface SelectItemProps {
  value: string
  children?: React.ReactNode
  onSelect?: (value: string) => void
}

export interface SelectValueProps {
  placeholder?: string
}

const SelectContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: false,
  setOpen: () => {},
})

const Select = ({ value, onValueChange, defaultValue, disabled, children }: SelectProps) => {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(defaultValue || "")

  const currentValue = value !== undefined ? value : internalValue

  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
    setOpen(false)
  }

  return (
    <SelectContext.Provider value={{ value: currentValue, onValueChange: handleValueChange, open, setOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className = "", children, ...props }, ref) => {
    const { open, setOpen } = React.useContext(SelectContext)

    return (
      <button
        ref={ref}
        type="button"
        className={`
          flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm
          ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500
          focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
          ${className}
        `}
        onClick={() => setOpen(!open)}
        {...props}
      >
        {children}
        <svg
          className={`h-4 w-4 opacity-50 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = ({ children }: SelectContentProps) => {
  const { open } = React.useContext(SelectContext)

  if (!open) return null

  return (
    <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-white shadow-lg">
      <div className="max-h-60 overflow-auto p-1">
        {children}
      </div>
    </div>
  )
}

const SelectItem = ({ value, children, onSelect }: SelectItemProps) => {
  const { onValueChange } = React.useContext(SelectContext)

  const handleSelect = () => {
    onValueChange?.(value)
    onSelect?.(value)
  }

  return (
    <div
      className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
      onClick={handleSelect}
    >
      {children}
    </div>
  )
}

const SelectValue = ({ placeholder }: SelectValueProps) => {
  const { value } = React.useContext(SelectContext)

  return (
    <span className={value ? "" : "text-gray-500"}>
      {value || placeholder}
    </span>
  )
}

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue }
