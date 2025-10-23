import { useState } from "react";
import { TaskDialog } from "./taskDialog";
import { useQuests } from "@/hooks/useQuests";
import QuestEditor from "./QuestEditor";

export function QuestListButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { quests } = useQuests();

  // const handleCreateQuest = async (name: string, color: string) => {
  //   await addQuest(name, color);
  //   setIsDialogOpen(false);
  // };

  return (
    <>
      <button
        onClick={() => setIsDialogOpen(true)}
        className="inline-flex text-sm items-center gap-1.5 px-2 py-1 font-light text-gray-700 bg-gray-100 border-[0.5px] border-gray-400 rounded-sm hover:bg-gray-200 transition-colors"
      >
        Quest list
      </button>

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title="Adding quest..."
      >
        <div className="px-2">
          {/* <QuestForm
            onSubmit={handleCreateQuest}
            onCancel={() => setIsDialogOpen(false)}
          /> */}
          <QuestEditor quests={quests} />
        </div>
      </TaskDialog>
    </>
  );
}

