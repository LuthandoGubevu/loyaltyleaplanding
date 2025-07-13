
"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Check, ChevronsUpDown, Store } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { getLoyaltyData } from "@/lib/mock-data"


type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>

interface StoreSwitcherProps extends PopoverTriggerProps {}

export function StoreSwitcher({ className }: StoreSwitcherProps) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const selectedStoreId = searchParams.get("storeId") || "all"

  const allStores = getLoyaltyData().stores;
  const stores = [
    { id: "all", name: "All Stores" },
    ...allStores
  ]

  const selectedStore = stores.find((store) => store.id === selectedStoreId)

  const handleStoreSelect = (storeId: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    if (storeId === "all") {
        newSearchParams.delete("storeId")
    } else {
        newSearchParams.set("storeId", storeId)
    }
    router.push(`${pathname}?${newSearchParams.toString()}`)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a store"
          className={cn("w-[200px] justify-between", className)}
        >
          <Store className="mr-2 h-4 w-4" />
          {selectedStore?.name}
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
            <CommandList>
                <CommandInput placeholder="Search store..." />
                <CommandEmpty>No store found.</CommandEmpty>
                <CommandGroup>
                    {stores.map((store) => (
                    <CommandItem
                        key={store.id}
                        onSelect={() => handleStoreSelect(store.id)}
                        className="text-sm"
                    >
                        <Store className="mr-2 h-4 w-4" />
                        {store.name}
                        <Check
                        className={cn(
                            "ml-auto h-4 w-4",
                            selectedStore?.id === store.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                        />
                    </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
