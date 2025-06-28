"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  emptyMessage = "No results found.",
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  // Filter options based on search input
  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return options;

    return options.filter((option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue, options]);

  // Find the currently selected option
  const selectedOption = React.useMemo(
    () => options.find((option) => option.value === value),
    [value, options]
  );

  // Reset search when closing the popover
  React.useEffect(() => {
    if (!open) {
      setSearchValue("");
    }
  }, [open]);

  // Handle command input change
  const handleInputChange = (value: string) => {
    setSearchValue(value);
  };

  // Handle selection
  const handleSelect = React.useCallback(
    (currentValue: string) => {
      onChange(currentValue === value ? "" : currentValue);
      setOpen(false);
    },
    [onChange, value]
  );

  // Clear selection
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between bg-white border-input",
              className
            )}
            onClick={() => setOpen(!open)}
          >
            {selectedOption ? (
              <div className="flex items-center justify-between w-full">
                <span className="truncate text-left">
                  {selectedOption.label}
                </span>
                {value && (
                  <X
                    className="ml-2 h-4 w-4 shrink-0 opacity-50 hover:opacity-100 cursor-pointer"
                    onClick={handleClear}
                    aria-label="Clear selection"
                  />
                )}
              </div>
            ) : (
              <span className="text-muted-foreground text-left">
                {placeholder}
              </span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0 shadow-md bg-white"
          align="start"
          sideOffset={5}
        >
          <Command shouldFilter={false} className="max-h-96">
            <CommandInput
              placeholder={`Search ${placeholder.toLowerCase()}...`}
              value={searchValue}
              onValueChange={handleInputChange}
            />
            <CommandEmpty className="py-4 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </CommandEmpty>
            <CommandGroup className="max-h-60 overflow-y-auto">
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={handleSelect}
                  className="cursor-pointer hover:bg-accent py-2"
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{option.label}</span>
                    {option.value === value && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
