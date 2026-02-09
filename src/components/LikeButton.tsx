"use client";

import { useOptimistic, useTransition } from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { toggleProjectLike } from "@/lib/actions";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  projectId: string;
  initialLikes: number;
  initialHasLiked: boolean;
}

export default function LikeButton({ projectId, initialLikes, initialHasLiked }: LikeButtonProps) {
  const [isPending, startTransition] = useTransition();
  
  const [optimisticState, addOptimisticState] = useOptimistic(
    { likes: initialLikes, hasLiked: initialHasLiked },
    (state, newHasLiked: boolean) => ({
      likes: newHasLiked ? state.likes + 1 : Math.max(0, state.likes - 1),
      hasLiked: newHasLiked,
    })
  );

  const handleToggle = async () => {
    const newState = !optimisticState.hasLiked;
    
    startTransition(async () => {
      addOptimisticState(newState);
      await toggleProjectLike(projectId);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "group flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 select-none",
        optimisticState.hasLiked 
          ? "bg-red-500/10 border-red-500/20 text-red-600" 
          : "bg-background border-border hover:border-red-500/30 hover:bg-red-500/5 text-muted-foreground"
      )}
    >
      <motion.div
        animate={optimisticState.hasLiked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Heart className={cn("h-5 w-5 transition-colors", optimisticState.hasLiked ? "fill-current" : "fill-transparent")} />
      </motion.div>
      <span className="text-sm font-medium tabular-nums">{optimisticState.likes}</span>
    </button>
  );
}