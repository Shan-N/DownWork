'use client';

import { useState } from 'react';
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillComboboxProps {
  skills: string[];
  value: string;
  onChange: (value: string) => void;
}

export const SkillCombobox = ({ skills, value, onChange }: SkillComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const filteredSkills = skills.filter((skill) =>
    skill.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleSelect = (skill: string) => {
    onChange(skill);
    setOpen(false);
  };

  const handleAddNew = () => {
    if (inputValue.trim() && !skills.includes(inputValue)) {
      onChange(inputValue);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="justify-between w-full">
          {value || "Select or add skill"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search or add skill..."
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            {filteredSkills.length > 0 ? (
              filteredSkills.map((skill, index) => (
                <CommandItem
                  key={index}
                  onSelect={() => handleSelect(skill)}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === skill ? "opacity-100" : "opacity-0")} />
                  {skill}
                </CommandItem>
              ))
            ) : (
              <CommandItem onSelect={handleAddNew}>
                Add &quot;{inputValue}&quot;
              </CommandItem>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
