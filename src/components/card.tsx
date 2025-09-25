import Tag from "./tag";

interface CardProps {
  title: string;
}

export default function Card({ title }: CardProps) {
  return (
    <div className="flex flex-col gap-2 p-3 bg-gray-100 rounded-lg border border-gray-200 cursor-grab active:cursor-grabbing">
      <h1 className="text-sm text-gray-950">{title}</h1>
      <div className="flex flex-row gap-2">
        <Tag />
      </div>
    </div>
  );
}