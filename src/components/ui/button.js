export const Button = ({ className, children, ...props }) => (
    <button 
      className={`px-4 py-2 rounded-lg transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );