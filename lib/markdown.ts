import { compileMDX } from "next-mdx-remote/rsc";
import path from "path";
import { promises as fs } from "fs";
import remarkGfm from "remark-gfm";
import rehypePrism from "rehype-prism-plus";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import rehypeCodeTitles from "rehype-code-titles";
import { page_routes, ROUTES } from "./routes-config";
import { visit } from "unist-util-visit";
import matter from "gray-matter";
import { getIconName, hasSupportedExtension } from "./utils";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Pre from "@/components/markdown/pre";
import Note from "@/components/markdown/note";
import Image from "@/components/markdown/image";
import Link from "@/components/markdown/link";
import Outlet from "@/components/markdown/outlet";
import Files from "@/components/markdown/files";
import { Stepper, StepperItem } from "@/components/markdown/stepper";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

const components = {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
	pre: Pre,
	Note,
	img: Image,
	a: Link,
	Outlet,
	Files,
	Stepper,
	StepperItem,
	table: Table,
	thead: TableHeader,
	th: TableHead,
	tr: TableRow,
	tbody: TableBody,
	t: TableCell,
};

// Define a type for AST nodes that represent HTML elements
interface HtmlElementNode {
	type: string;
	tagName: string;
	properties: {
		className?: string[];
		[key: string]: string | string[] | undefined; // Allow additional properties
	};
	raw?: string;
	children: Array<HtmlElementNode | TextNode>;
}

// Define a type for text nodes
interface TextNode {
	type: string;
	value: string;
}

/**
 * Parses MDX content and returns a compiled result.
 *
 * @template Frontmatter - The type of frontmatter expected.
 * @param {string} rawMdx - The raw MDX content.
 * @returns {Promise<any>} The compiled MDX content.
 */
async function parseMdx<Frontmatter>(rawMdx: string) {
	return await compileMDX<Frontmatter>({
		source: rawMdx,
		options: {
			parseFrontmatter: true,
			mdxOptions: {
				rehypePlugins: [
					preProcess,
					rehypeCodeTitles,
					rehypeCodeTitlesWithLogo,
					rehypePrism,
					rehypeSlug,
					rehypeAutolinkHeadings,
					postProcess,
				],
				remarkPlugins: [remarkGfm],
			},
		},
		components,
	});
}

// Base MDX frontmatter type
export type BaseMdxFrontmatter = {
	title: string;
	description: string;
};

/**
 * Retrieves and parses MDX documents for a given slug.
 *
 * @param {string} slug - The slug identifying the document.
 * @returns {Promise<any>} The parsed MDX content.
 */
export async function getDocsForSlug(slug: string) {
	try {
		const contentPath = getDocsContentPath(slug);
		const rawMdx = await fs.readFile(contentPath, "utf-8");
		return await parseMdx<BaseMdxFrontmatter>(rawMdx);
	} catch (err) {
		console.log(err);
	}
}

/**
 * Extracts the table of contents from a document.
 *
 * @param {string} slug - The slug identifying the document.
 * @returns {Promise<Array<{level: number, text: string, href: string}>>} The extracted headings.
 */
export async function getDocsTocs(slug: string) {
	const contentPath = getDocsContentPath(slug);
	const rawMdx = await fs.readFile(contentPath, "utf-8");
	const headingsRegex = /^(#{2,4})\s(.+)$/gm;

	let match;
	const extractedHeadings = [];

	while ((match = headingsRegex.exec(rawMdx)) !== null) {
		const headingLevel = match[1].length;
		const headingText = match[2].trim();
		const slug = sluggify(headingText);
		extractedHeadings.push({
			level: headingLevel,
			text: headingText,
			href: `#${slug}`,
		});
	}

	return extractedHeadings;
}

/**
 * Retrieves the previous and next pages relative to the current path.
 *
 * @param {string} path - The current path.
 * @returns {{prev: any, next: any}} The previous and next pages.
 */
export function getPreviousNext(path: string) {
	const index = page_routes.findIndex(({ href }) => href == `/${path}`);
	return {
		prev: page_routes[index - 1],
		next: page_routes[index + 1],
	};
}

/**
 * Converts a string into a URL-friendly slug.
 *
 * @param {string} text - The text to slugify.
 * @returns {string} The slugified text.
 */
function sluggify(text: string) {
	return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

/**
 * Constructs the file path for a document based on its slug.
 *
 * @param {string} slug - The slug identifying the document.
 * @returns {string} The file path.
 */
function getDocsContentPath(slug: string) {
	return path.join(process.cwd(), "/contents/docs/", `${slug}/index.mdx`);
}

/**
 * Extracts frontmatter from raw markdown content.
 *
 * @template Frontmatter - The type of frontmatter expected.
 * @param {string} rawMd - The raw markdown content.
 * @returns {Frontmatter | undefined} The extracted frontmatter.
 */
function justGetFrontmatterFromMD<Frontmatter>(rawMd: string): Frontmatter | undefined {
	try {
		const { data } = matter(rawMd);
		return data as Frontmatter;
	} catch (err) {
		console.error("Error parsing frontmatter:", err);
		return undefined;
	}
}

/**
 * Retrieves all child pages for a given path string.
 *
 * @param {string} pathString - The path string to analyze.
 * @returns {Promise<Array<BaseMdxFrontmatter & { href: string }>>} The child pages.
 */
export async function getAllChilds(pathString: string) {
	const items = pathString.split("/").filter((it) => it != "");
	let page_routes_copy = ROUTES;

	let prevHref = "";
	for (const it of items) {
		const found = page_routes_copy.find((innerIt) => innerIt.href == `/${it}`);
		if (!found) break;
		prevHref += found.href;
		page_routes_copy = found.items ?? [];
	}
	if (!prevHref) return [];

	const results = await Promise.all(
		page_routes_copy.map(async (it) => {
			try {
				const totalPath = path.join(
					process.cwd(),
					"/contents/docs/",
					prevHref,
					it.href,
					"index.mdx",
				);
				const raw = await fs.readFile(totalPath, "utf-8");
				const frontmatter = justGetFrontmatterFromMD<BaseMdxFrontmatter>(raw);
				if (!frontmatter) return undefined;

				return {
					...frontmatter,
					href: `/docs${prevHref}${it.href}`,
				};
			} catch (err) {
				console.error("Error processing file:", err);
				return undefined;
			}
		}),
	);

	return results.filter((it): it is BaseMdxFrontmatter & { href: string } => !!it);
}

/**
 * Pre-processes the AST to extract raw code from <pre> elements.
 *
 * @returns {(tree: HtmlElementNode) => void} The pre-processing function.
 */
const preProcess = (): (tree: HtmlElementNode) => void => (tree: HtmlElementNode) => {
	visit(tree, "element", (node: HtmlElementNode) => {
		if (node?.type === "element" && node?.tagName === "pre") {
			const [codeEl] = node.children as HtmlElementNode[];
			if (codeEl.tagName !== "code") return;
			node.raw = (codeEl.children[0] as TextNode).value;
		}
	});
};

/**
 * Post-processes the AST to add raw code to <pre> elements.
 *
 * @returns {(tree: HtmlElementNode) => void} The post-processing function.
 */
const postProcess = (): (tree: HtmlElementNode) => void => (tree: HtmlElementNode) => {
	visit(tree, "element", (node: HtmlElementNode) => {
		if (node?.type === "element" && node?.tagName === "pre") {
			node.properties["raw"] = node.raw;
		}
	});
};

// Author type
export type Author = {
	avatar?: string;
	handle: string;
	username: string;
	handleUrl: string;
};

// Blog MDX frontmatter type
export type BlogMdxFrontmatter = BaseMdxFrontmatter & {
	date: string;
	authors: Author[];
	cover: string;
};

/**
 * Retrieves all static paths for blog entries.
 *
 * @returns {Promise<string[]>} The list of blog slugs.
 */
export async function getAllBlogStaticPaths() {
	try {
		const blogFolder = path.join(process.cwd(), "/contents/blogs/");
		const res = await fs.readdir(blogFolder);
		return res.map((file) => file.split(".")[0]);
	} catch (err) {
		console.log(err);
	}
}

/**
 * Retrieves all blog entries with their frontmatter.
 *
 * @returns {Promise<Array<BlogMdxFrontmatter & { slug: string }>>} The list of blogs.
 */
export async function getAllBlogs() {
	const blogFolder = path.join(process.cwd(), "/contents/blogs/");
	const files = await fs.readdir(blogFolder);
	const uncheckedRes = await Promise.all(
		files.map(async (file) => {
			if (!file.endsWith(".mdx")) return undefined;
			const filepath = path.join(process.cwd(), `/contents/blogs/${file}`);
			const rawMdx = await fs.readFile(filepath, "utf-8");
			const frontmatter = justGetFrontmatterFromMD<BlogMdxFrontmatter>(rawMdx);
			if (!frontmatter) return undefined;
			return {
				...frontmatter,
				slug: file.split(".")[0],
			};
		}),
	);
	return uncheckedRes.filter((it): it is BlogMdxFrontmatter & { slug: string } => !!it);
}

/**
 * Retrieves and parses a blog entry for a given slug.
 *
 * @param {string} slug - The slug identifying the blog entry.
 * @returns {Promise<any>} The parsed blog content.
 */
export async function getBlogForSlug(slug: string) {
	const blogFile = path.join(process.cwd(), "/contents/blogs/", `${slug}.mdx`);
	try {
		const rawMdx = await fs.readFile(blogFile, "utf-8");
		return await parseMdx<BlogMdxFrontmatter>(rawMdx);
	} catch {
		return undefined;
	}
}

/**
 * Rehype plugin to add icons to code titles based on file extensions.
 */
function rehypeCodeTitlesWithLogo(): (tree: HtmlElementNode) => void {
	return (tree: HtmlElementNode) => {
		visit(tree, "element", (node: HtmlElementNode) => {
			if (
				node.tagName === "div" &&
				node.properties.className?.includes("rehype-code-title")
			) {
				const titleTextNode = node.children.find(
					(child): child is TextNode => child.type === "text"
				);
				if (!titleTextNode) return;

				const titleText = titleTextNode.value;
				const match = hasSupportedExtension(titleText);
				if (!match) return;

				const splittedNames = titleText.split(".");
				const ext = splittedNames[splittedNames.length - 1];
				const iconClass = `devicon-${getIconName(ext)}-plain text-[17px]`;

				if (iconClass) {
					node.children.unshift({
						type: "element",
						tagName: "i",
						properties: { className: [iconClass, "code-icon"] },
						children: [],
					});
				}
			}
		});
	};
}
