import { Plus } from "lucide-react";
import { useState } from "react";
import { Popover } from "@base-ui-components/react/popover";
import { Quest, db } from "@/db";
import DeleteButton from "./ui/delete-button";
import { ColorPicker } from "./ui/color";
import { useColors } from "@/hooks/useColors";
import { EditableTitle } from "./ui/editable-title";

export default function QuestEditor({ quests }: { quests: Quest[] }) {
  const [localQuests, setLocalQuests] = useState<Quest[]>(quests);
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);
  const [isCreatingQuest, setIsCreatingQuest] = useState(false);
  const [newQuestColor, setNewQuestColor] = useState("gray");

  const { colors } = useColors();


  const getQuestColorClass = (colorId?: string): string => {
    return colors.find((c) => c.id === colorId)?.solidBg || "bg-gray-300";
  };

  const handleColorChange = async (id: number | undefined, newColor: string) => {
    if (!id) return;

    // Update local state immediately for responsive UI
    setLocalQuests((prevQuests) =>
      prevQuests.map((quest) =>
        quest.id === id ? { ...quest, color: newColor } : quest,
      ),
    );

    // Persist to database
    try {
      await db.quests.update(id, {
        color: newColor,
        updatedAt: new Date(),
      });
      console.log(`Quest ${id} color updated to ${newColor}`);
    } catch (error) {
      console.error("Failed to update quest color:", error);
    }

    // Close the popover
    setOpenPopoverId(null);
  };

  const handleTitleChange = async (id: number | undefined, newTitle: string) => {
    if (!id) return;
    
    // Update local state
    setLocalQuests((prevQuests) =>
      prevQuests.map((quest) =>
        quest.id === id ? { ...quest, name: newTitle } : quest,
      ),
    );

    // Persist to database
    try {
      await db.quests.update(id, {
        name: newTitle,
        updatedAt: new Date(),
      });
      console.log(`Quest ${id} name updated to ${newTitle}`);
    } catch (error) {
      console.error("Failed to update quest name:", error);
    }
  };

  const handleCreateQuest = async (name: string) => {
    if (!name.trim()) {
      setIsCreatingQuest(false);
      setNewQuestColor("blue");
      return;
    }

    // Get the max order for new quest
    const maxOrder =
      localQuests.length > 0
        ? Math.max(...localQuests.map((q) => q.order))
        : 0;

    const newQuest: Quest = {
      id: undefined,
      name: name.trim(),
      color: newQuestColor,
      status: "active",
      order: maxOrder + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const id = await db.quests.add(newQuest);
      console.log(`New quest created with ID: ${id}`);
      
      // Add to local state with the new id
      setLocalQuests((prevQuests) => [
        ...prevQuests,
        { ...newQuest, id: id as number },
      ]);
      
      // Reset state
      setIsCreatingQuest(false);
      setNewQuestColor("blue");
    } catch (error) {
      console.error("Failed to create quest:", error);
    }
  };

  const handleNewQuestColorChange = (colorId: string) => {
    setNewQuestColor(colorId);
    setOpenPopoverId(-1); // Close popover for new quest
  };

  const handleDeleteQuest = async (questId: number) => {
    // Update local state
    setLocalQuests((prevQuests) => prevQuests.filter((quest) => quest.id !== questId));

    // Persist to database
    try {
      await db.quests.delete(questId);
      console.log(`Quest ${questId} deleted`);
    } catch (error) {
      console.error("Failed to delete quest:", error);
    }
  };

  return (
    <>
      <div aria-label="table-body">
        {localQuests.map((quest) => (
          <div
            key={quest.id}
            aria-label="table-row"
            className="py-2 px-1.5 -mx-2 flex flex-row justify-between items-center gap-1.5 not-last:border-b-[0.25px] border-gray-200 hover:bg-gray-100/40"
          >
            <div className="flex flex-row justify-start items-center gap-1">
              <Popover.Root 
                open={openPopoverId === quest.id}
                onOpenChange={(open) => setOpenPopoverId(open && quest.id ? quest.id : null)}
              >
                <Popover.Trigger className="flex size-6 items-center justify-center rounded-sm select-none hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100 data-[popup-open]:bg-gray-100">
                  <div className={`h-2 w-2 rounded-full ${getQuestColorClass(quest.color)}`} />
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Positioner sideOffset={6}>
                    <Popover.Popup className="origin-[var(--transform-origin)] rounded-md transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0">
                      <ColorPicker 
                        colors={colors}
                        defaultColor={"gray"} 
                        onColorChange={(newColor) => handleColorChange(quest.id, newColor)} 
                      />
                    </Popover.Popup>
                  </Popover.Positioner>
                </Popover.Portal>
              </Popover.Root>
              <EditableTitle
                name={quest.name}
                onTitleChange={(newTitle) =>
                  handleTitleChange(quest.id, newTitle)
                }
                className="text-sm font-muted text-gray-800 px-2 -mx-1 min-h-6 rounded-sm"
              ></EditableTitle>
            </div>
            <DeleteButton onDelete={() => handleDeleteQuest(quest.id!)}></DeleteButton>
          </div>
        ))}
        {isCreatingQuest ? (
          <div
            aria-label="table-row"
            className="py-2 px-1.5 -mx-2 flex flex-row justify-between items-center gap-1.5 not-last:border-b-[0.25px] border-gray-200 bg-gray-50"
          >
            <div className="flex flex-row justify-start items-center gap-1">
              <Popover.Root 
                open={openPopoverId === -1}
                onOpenChange={(open) => setOpenPopoverId(open ? -1 : null)}
              >
                <Popover.Trigger className="flex size-6 items-center justify-center rounded-sm select-none hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100 data-[popup-open]:bg-gray-100">
                  <div className={`h-2 w-2 rounded-full ${getQuestColorClass(newQuestColor)}`} />
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Positioner sideOffset={6}>
                    <Popover.Popup className="origin-[var(--transform-origin)] rounded-md transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0">
                      <ColorPicker 
                        colors={colors} 
                        defaultColor={newQuestColor} 
                        onColorChange={handleNewQuestColorChange} 
                      />
                    </Popover.Popup>
                  </Popover.Positioner>
                </Popover.Portal>
              </Popover.Root>
            </div>
          </div>
        ) : (
          <div
            aria-label="table-row"
            className="group py-2 px-1.5 -mx-2 flex flex-row justify-between items-center gap-1.5 not-last:border-b-[0.25px] text-gray-600 border-gray-200 hover:bg-gray-100/50"
          >
            <div className="flex flex-row justify-start items-center gap-1">
            <div 
              className="h-6 w-6 flex justify-center items-center transition rounded-sm text-gray-400 group-hover:text-gray-600"
            >
              <Plus size={14} />
            </div>
              <EditableTitle
                name="New quest"
                onTitleChange={handleCreateQuest}
                onCancel={() => {
                  setIsCreatingQuest(false);
                  setNewQuestColor("blue");
                }}
                className="text-sm group-hover:text-gray-800 px-2 -mx-1 min-h-6 rounded-sm transition-colors"
              ></EditableTitle>
            </div>
          </div>
        )}
      </div>
    </>
  );
}