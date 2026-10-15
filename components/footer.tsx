"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import Image from "next/image";
import {GitCommit, HeartIcon} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Icons } from "./icons";
import { buttonVariants } from "./ui/button";

export function Footer() {
  return (
    <footer className="border-t w-full h-16">
      <div className="container flex items-center sm:justify-between justify-center sm:gap-0 gap-4 h-full text-muted-foreground text-sm flex-wrap sm:py-0 py-3 max-sm:px-4">
        <Link
          href="https://github.com/smeltery"
          className="inline-flex items-center"
        >
          <Image src="/smeltery.svg" alt="Smeltery Labs" width={24} height={24} />
        </Link>

        <div className="gap-4 items-center hidden md:flex">
          <FooterButtons />
        </div>
      </div>
    </footer>
  );
}

export function FooterButtons() {
	const [commitHash, setCommitHash] = useState<string | null>(null)

	useEffect(() => {
		const fetchCommitHash = async () => {
			try {
				const response = await fetch('/api/commit')
				if (response.ok) {
					const data = await response.json()
					setCommitHash(data.commitHash)
				} else {
					console.error('Failed to fetch commit hash')
				}
			} catch (error) {
				console.error('Error fetching commit hash:', error)
			}
		}

		fetchCommitHash()
	}, [])

  return (
    <>
		{commitHash && (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<div>
							<Link
								style={{ borderRadius: "2em" }}
								className={buttonVariants({ variant: "outline", size: "sm" })}
								href={`https://github.com/smeltery/learn-git/commit/${commitHash}`}
								target="_blank"
								rel="noopener noreferrer"
							>
								<GitCommit className="w-4 h-4" />
								<span className="font-mono">{commitHash.slice(0, 7)}</span>
							</Link>
						</div>
					</TooltipTrigger>
					<TooltipContent>
						<p>View latest commit</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		)}
		<Link
			className="text-sm hover:text-primary transition-colors duration-200 text-muted-foreground flex items-center gap-1"
			href="https://github.com/smeltery/learn-git"
			target="_blank"
			rel="noopener noreferrer"
		>
			<Icons.gitHub className="w-4 h-4" />
		</Link>
      <Link
        href="https://github.com/sponsors/smeltery"
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        <HeartIcon className="h-4 w-4 mr-2 text-red-600 fill-current" />
        Sponsor
      </Link>
    </>
  );
}
