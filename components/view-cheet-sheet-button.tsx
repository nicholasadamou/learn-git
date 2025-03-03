'use client'

import {Button} from "@/components/ui/button"
import {MoveUpRightIcon} from "lucide-react"

export function ViewCheetSheetButton() {
	return (<Button
			variant="ghost">
			<a
				className="flex uppercase"
				href="https://training.github.com/downloads/github-git-cheat-sheet.pdf"
				target="_blank"
				rel="noopener noreferrer"
			>
				<span className="inset-0 opacity-20 rounded-md animate-pulse"></span>
				<MoveUpRightIcon
					className={`mr-2 h-4 w-4 transition-transform duration-300 ease-in-out`}
				/>
				View Cheat Sheet
			</a>
		</Button>


	)
}
