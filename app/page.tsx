import {ViewCheetSheetButton} from "@/components/view-cheet-sheet-button";
import {GetStartedButton} from "@/components/get-started-button";
import {MoveUpRightIcon, TerminalIcon} from "lucide-react";
import Link from "next/link";
import {AnimatedShinyText} from "@/components/magicui/animated-shiny-text";
import {SparklesText} from "@/components/magicui/sparkles-text";

export default function Home() {
	return (<>
		<div
			className="flex h-[80vh] flex-col items-center justify-center text-center px-2 py-8">
			<Link
				href="https://git-scm.com/doc"
				target="_blank"
				rel="noopener noreferrer"
				className="mb-4 group rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800"
			>
				<AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
					<span>✨ Discover More About Git</span>
					<MoveUpRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
				</AnimatedShinyText>
			</Link>
			<h1 className="text-3xl font-bold mb-4 sm:text-7xl">
				<SparklesText text="Learn Git" />
			</h1>
			<p className="mb-8 sm:text-xl max-w-[800px] text-muted-foreground">
				Learn Git is a free and open-source platform to learn Git and
				GitHub. It is designed to be simple and easy to understand for
				beginners.
			</p>
			<div className="flex flex-row items-center gap-5">
				<GetStartedButton/>
				<ViewCheetSheetButton/>
			</div>
			<span className="flex flex-row items-center gap-2 text-zinc-400 text-md mt-7 -mb-12 max-[800px]:mb-12">
        <TerminalIcon className="w-4 h-4 mr-1"/> ~ git init
      </span>
		</div>
	</>);
}
