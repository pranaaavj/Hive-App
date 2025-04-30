import React, {ReactNode} from "react";

interface InputFieldProps {
    type: string,
    name: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void
    placeholder: string,
    icon?: ReactNode,
    suffix?: ReactNode,
    error?: string
}
export const InputField: React.FC<InputFieldProps> = ({
    type,
    name,
    value,
    onChange,
    onBlur,
    placeholder,
    icon,
    suffix,
    error
}) => {
    return (
        <div className="space-y-2">
        <div className={`relative rounded-md shadow-sm ${error ? 'ring-1 ring-red-500' : ''}`}>
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              {icon}
            </div>
          )}
          
          <input
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className={`block w-full rounded-md border-0 py-3 ${
              icon ? 'pl-10' : 'pl-4'
            } ${
              suffix ? 'pr-10' : 'pr-4'
            } text-gray-900 ring-1 ring-inset ${
              error ? 'ring-red-300' : 'ring-gray-300'
            } placeholder:text-gray-400 focus:ring-2 focus:ring-inset ${
              error ? 'focus:ring-red-500' : 'focus:ring-gray-600'
            } transition-all duration-200 ease-in-out sm:text-sm sm:leading-6`}
            placeholder={placeholder}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${name}-error` : undefined}
          />
          
          {suffix && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {suffix}
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-sm text-red-600" id={`${name}-error`} role="alert">
            {error}
          </p>
        )}
      </div>
    )
}