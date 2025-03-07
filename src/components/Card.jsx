export function Card({ className, children, ...props }) {
  return (
    <div
      className={`rounded-2xl shadow-md bg-white p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={`text-gray-700 ${className}`} {...props}>
      {children}
    </div>
  );
}
