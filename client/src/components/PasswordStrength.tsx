import React, {useMemo} from "react";

interface PasswordStrengthProps {
    password: string
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({password}) => {
    const {strength, label, message} = useMemo(() => {
        if(!password) {
            return {strength: 0, label: "", message: ""}
        }
        // Calculate password strength
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    // Normalize to 0-4 scale
    strength = Math.min(4, Math.floor(strength / 1.5));
    
    // Define labels and messages
    const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
    const messages = [
      'Try adding more characters and variety',
      'Add numbers or special characters',
      'Good start! Try making it longer',
      'Strong password, well done!',
      'Excellent password security!'
    ];
    return {
        strength,
        label: labels[strength],
        message: messages[strength]
      };
    
    }, [password])

    const getBarColors = (index: number) => {
        if (index <= strength) {
          switch (strength) {
            case 0: return 'bg-red-500';
            case 1: return 'bg-orange-500';
            case 2: return 'bg-yellow-500';
            case 3: return 'bg-green-500';
            case 4: return 'bg-green-600';
            default: return 'bg-gray-200';
          }
        }
        return 'bg-gray-200';
      };

      const getLabelColor = () => {
        switch (strength) {
          case 0: return 'text-red-500';
          case 1: return 'text-orange-500';
          case 2: return 'text-yellow-500';
          case 3: return 'text-green-500';
          case 4: return 'text-green-600';
          default: return 'text-gray-500';
        }
      };

      return (
        <div className="space-y-2">
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map((index) => (
              <div 
                key={index}
                className={`h-1 flex-1 rounded-sm transition-colors duration-300 ${getBarColors(index)}`}
                aria-hidden="true"
              />
            ))}
          </div>
          
          <div className="flex justify-between items-center">
            <span className={`text-xs font-medium ${getLabelColor()}`}>
              {label}
            </span>
            <span className="text-xs text-gray-500">
              {message}
            </span>
          </div>
        </div>
      );
}