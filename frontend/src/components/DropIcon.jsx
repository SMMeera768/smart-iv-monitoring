export default function DropIcon({ size = 20, color = '#EAF6F5' }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 1C10 1 2 11.5 2 16.5C2 21.19 5.58 24 10 24C14.42 24 18 21.19 18 16.5C18 11.5 10 1 10 1Z"
        fill={color}
      />
    </svg>
  );
}
