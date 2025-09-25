import { useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import Card from "./components/card";
import Droppable from "./components/droppable";
import Draggable from "./components/draggable";

const today = new Date();
const formattedDate = today.toLocaleDateString("en-US", { weekday: "long", month: "numeric", day: "numeric" });

// Define the structure for our cards
interface CardData {
  id: string;
  title: string;
  columnId: string;
}

// Initial data - cards in different columns
const initialCards: CardData[] = [
  { id: "card-1", title: "Design simple Kanban board", columnId: "ready" },
  { id: "card-2", title: "Implement drag and drop", columnId: "doing" },
  { id: "card-3", title: "Add animations", columnId: "done" },
];

const columns = [
  { id: "ready", title: "Ready" },
  { id: "doing", title: "Doing" },
  { id: "done", title: "Done" },
];

export default function App() {
  const [cards, setCards] = useState<CardData[]>(initialCards);
  const [activeCard, setActiveCard] = useState<CardData | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = cards.find(c => c.id === active.id);
    setActiveCard(card || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const cardId = active.id as string;
    const newColumnId = over.id as string;

    setCards(prevCards => 
      prevCards.map(card => 
        card.id === cardId 
          ? { ...card, columnId: newColumnId }
          : card
      )
    );
    
    setActiveCard(null);
  };

  return (
    <>
      <header className="shrink-0 flex justify-center items-center top-0 z-10 min-h-[48px] border-b border-gray-400">
        <span className="font-light text-sm text-gray-600">{formattedDate}</span>
      </header>
      <main className="grow-1 grid grid-cols-3 w-full h-full py-4">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {columns.map((column) => (
            <div className="flex flex-col grow-1 gap-2 h-full border-r border-gray-400 px-4">
              <span className="text-sm font-light text-gray-800">{column.title}</span>
              <Droppable key={column.id} id={column.id}>
                <div className="flex flex-col gap-2 col-span-1 h-full">
                  {cards
                    .filter(card => card.columnId === column.id)
                    .map(card => (
                      <Draggable key={card.id} id={card.id}>
                        <Card title={card.title} />
                      </Draggable>
                    ))}
                </div>
              </Droppable>
            </div>
          ))}
          <DragOverlay>
            {activeCard ? (
              <Card title={activeCard.title} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>
    </>
  );
}