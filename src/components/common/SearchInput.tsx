
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  onSearch?: (value: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Buscar...',
  onSearch,
  ...props
}) => {
  const [value, setValue] = React.useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };
  
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-nutri-green">
        <Search size={18} />
      </div>
      <Input
        type="text"
        className="pl-10 pr-4 py-2 bg-white border border-input text-foreground rounded-md shadow-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-nutri-green focus-visible:ring-offset-0"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        {...props}
      />
    </div>
  );
};

export default SearchInput;
